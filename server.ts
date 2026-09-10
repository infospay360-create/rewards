import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_LEADERBOARD_USERS } from './src/data/initialData';
import { LeaderboardUser } from './src/types';
import { calculateTickets, sortLeaderboard } from './src/utils/leaderboardUtils';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Supabase Configuration
const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'nqkwsnkyvqktykgoijos';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MT7oSxtBkkEl8zmGxwrFlA_8cdzCT2W';
const SUPABASE_TABLE = 'leaderboard_users';

let supabaseServer: SupabaseClient | null = null;
try {
  supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
  console.log('[Supabase Server] Client configured for project:', SUPABASE_PROJECT_ID);
} catch (e) {
  console.error('[Supabase Server] Failed to initialize client:', e);
}

// Persistent store file path on container filesystem
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'leaderboard-store.json');

// In-memory cache for ultra-fast response
let cachedUsers: LeaderboardUser[] = [];
let dataVersion = Date.now();

// Set of active SSE (Server-Sent Events) client connections
const sseClients = new Set<express.Response>();

// Supabase sync helpers
async function syncUserToSupabase(user: LeaderboardUser) {
  if (!supabaseServer) return;
  try {
    const row = {
      id: user.id || `user-${Date.now()}`,
      user_id: user.userId.trim().toUpperCase(),
      name: user.name.trim(),
      direct_count: Math.max(0, Number(user.directCount) || 0),
      ticket_count: Math.max(0, Number(user.ticketCount) || 0),
      custom_ticket_bonus: Math.max(0, Number(user.customTicketBonus) || 0),
      created_at: user.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabaseServer
      .from(SUPABASE_TABLE)
      .upsert(row, { onConflict: 'user_id' });
    if (error) {
      console.warn('[Supabase Server] Sync error:', error.message);
    } else {
      console.log(`[Supabase Server] Synced user ${user.userId} to Supabase successfully`);
    }
  } catch (err) {
    console.warn('[Supabase Server] Sync exception:', err);
  }
}

async function deleteUserFromSupabase(cleanId: string, id?: string) {
  if (!supabaseServer) return;
  try {
    const { error } = await supabaseServer
      .from(SUPABASE_TABLE)
      .delete()
      .or(`user_id.eq.${cleanId},id.eq.${id || cleanId}`);
    if (error) {
      console.warn('[Supabase Server] Delete error:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase Server] Delete exception:', err);
  }
}

async function syncAllUsersToSupabase(users: LeaderboardUser[]) {
  if (!supabaseServer) return;
  try {
    const rows = users.map((u) => ({
      id: u.id || `user-${Date.now()}`,
      user_id: u.userId.trim().toUpperCase(),
      name: u.name.trim(),
      direct_count: Math.max(0, Number(u.directCount) || 0),
      ticket_count: Math.max(0, Number(u.ticketCount) || 0),
      custom_ticket_bonus: Math.max(0, Number(u.customTicketBonus) || 0),
      created_at: u.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabaseServer
      .from(SUPABASE_TABLE)
      .upsert(rows, { onConflict: 'user_id' });
    if (error) {
      console.warn('[Supabase Server] Batch sync error:', error.message);
    } else {
      console.log(`[Supabase Server] Batch synced ${rows.length} users to Supabase`);
    }
  } catch (err) {
    console.warn('[Supabase Server] Batch sync exception:', err);
  }
}

async function hydrateFromSupabase(): Promise<boolean> {
  if (!supabaseServer) return false;
  try {
    const { data, error } = await supabaseServer
      .from(SUPABASE_TABLE)
      .select('*')
      .order('ticket_count', { ascending: false })
      .order('direct_count', { ascending: false });

    if (error) {
      console.warn('[Supabase Server] Could not fetch table:', error.message);
      return false;
    }

    if (Array.isArray(data) && data.length > 0) {
      const mapped: LeaderboardUser[] = data.map((row: any) => ({
        id: String(row.id || row.user_id),
        userId: String(row.user_id || '').toUpperCase(),
        name: String(row.name || ''),
        directCount: Number(row.direct_count || 0),
        ticketCount: Number(row.ticket_count || 0),
        customTicketBonus: Number(row.custom_ticket_bonus || 0),
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      }));
      cachedUsers = sortLeaderboard(mapped);
      persistStore();
      console.log(`[Supabase Server] Hydrated ${cachedUsers.length} users from Supabase!`);
      return true;
    } else if (Array.isArray(data) && data.length === 0) {
      console.log('[Supabase Server] Table exists but empty. Seeding initial contest users...');
      await syncAllUsersToSupabase(cachedUsers);
      return true;
    }
  } catch (err) {
    console.warn('[Supabase Server] Hydrate exception:', err);
  }
  return false;
}

// Initialize or load data from disk
function initStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedUsers = sortLeaderboard(parsed);
        dataVersion = Date.now();
        console.log(`[Store] Loaded ${cachedUsers.length} users from disk.`);
        return;
      }
    }

    // Seed with initial contest data
    cachedUsers = sortLeaderboard(INITIAL_LEADERBOARD_USERS);
    dataVersion = Date.now();
    fs.writeFileSync(DATA_FILE, JSON.stringify(cachedUsers, null, 2), 'utf-8');
    console.log(`[Store] Initialized store with ${cachedUsers.length} default users.`);
  } catch (err) {
    console.error('[Store] Error initializing store:', err);
    cachedUsers = sortLeaderboard(INITIAL_LEADERBOARD_USERS);
    dataVersion = Date.now();
  }
}

function persistStore(): void {
  try {
    dataVersion = Date.now();
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(cachedUsers, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Store] Failed to write to disk:', err);
  }
}

// Background Theme Store
const THEME_FILE = path.join(DATA_DIR, 'theme-store.json');
let themeVersion = Date.now();
let cachedTheme: any = {
  presetId: 'smartpay_official',
  name: 'SmartPay 360 Official (Poster Theme)',
  bgBaseColor: '#eefbf4',
  glowColor1: 'rgba(5, 150, 105, 0.25)',
  glowColor2: 'rgba(245, 158, 11, 0.20)',
  patternStyle: 'dots',
  glowIntensity: 'vibrant',
  isLight: true,
  updatedAt: new Date().toISOString(),
};

function initThemeStore(): void {
  try {
    if (fs.existsSync(THEME_FILE)) {
      const raw = fs.readFileSync(THEME_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.bgBaseColor) {
        cachedTheme = parsed;
        themeVersion = Date.now();
        console.log(`[ThemeStore] Loaded background theme: ${cachedTheme.name} (${cachedTheme.bgBaseColor})`);
        return;
      }
    }
    // If not exists, persist the new SmartPay 360 Official theme
    persistThemeStore();
  } catch (err) {
    console.warn('[ThemeStore] Could not load theme file:', err);
  }
}

function persistThemeStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(THEME_FILE, JSON.stringify(cachedTheme, null, 2), 'utf-8');
  } catch (err) {
    console.error('[ThemeStore] Failed to save theme:', err);
  }
}

function broadcastThemeUpdate(theme: any) {
  const payload = JSON.stringify({
    type: 'THEME_UPDATED',
    themeVersion,
    theme,
  });
  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Broadcast real-time update to all connected browsers and mobile devices
function broadcastLiveUpdate(source = 'update') {
  const payload = JSON.stringify({
    type: 'USERS_UPDATED',
    source,
    version: dataVersion,
    count: cachedUsers.length,
    users: cachedUsers,
  });

  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

// Initialize store at startup
initStore();
initThemeStore();

// ==========================================
// ANTI-CACHE & CORS MIDDLEWARE FOR ALL /api
// ==========================================
app.use((req, res, next) => {
  // Enforce zero caching across all browsers, mobile devices, and reverse proxies/CDNs
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  // Cross-Origin allowance for all browsers & mobile devices
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ==========================================
// REAL-TIME SSE (SERVER-SENT EVENTS) STREAM
// ==========================================
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send initial data immediately upon connecting
  const initialPayload = JSON.stringify({
    type: 'INITIAL',
    version: dataVersion,
    count: cachedUsers.length,
    users: cachedUsers,
    theme: cachedTheme,
  });
  res.write(`data: ${initialPayload}\n\n`);

  sseClients.add(res);

  // Keep-alive heartbeat every 15 seconds to prevent network timeouts
  const heartbeatTimer = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(heartbeatTimer);
      sseClients.delete(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeatTimer);
    sseClients.delete(res);
  });
});

// ==========================================
// REST API ROUTES
// ==========================================

// Lightweight version probe for ultra-fast polling across devices
app.get('/api/version', (req, res) => {
  res.json({
    version: dataVersion,
    themeVersion: themeVersion,
    theme: cachedTheme,
    count: cachedUsers.length,
    timestamp: new Date().toISOString(),
  });
});

// Health check with active live client count and version
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: dataVersion,
    themeVersion: themeVersion,
    count: cachedUsers.length,
    connectedClients: sseClients.size,
    timestamp: new Date().toISOString(),
  });
});

// GET all leaderboard users (always returns fresh data with version)
app.get('/api/users', (req, res) => {
  res.json({
    version: dataVersion,
    count: cachedUsers.length,
    users: cachedUsers,
  });
});

// GET background theme settings
app.get('/api/theme', (req, res) => {
  res.json({
    themeVersion: themeVersion,
    theme: cachedTheme,
  });
});

// POST update background theme settings
app.post('/api/theme', (req, res) => {
  const { theme } = req.body;
  if (!theme || typeof theme !== 'object' || !theme.bgBaseColor) {
    return res.status(400).json({ error: 'Valid theme object required' });
  }
  themeVersion = Date.now();
  cachedTheme = {
    ...cachedTheme,
    ...theme,
    updatedAt: new Date().toISOString(),
  };
  persistThemeStore();
  broadcastThemeUpdate(cachedTheme);
  console.log(`[Theme API] Updated background theme to: ${cachedTheme.name} (${cachedTheme.bgBaseColor}) (v${themeVersion})`);
  res.json({ success: true, themeVersion: themeVersion, theme: cachedTheme });
});

// POST replace all users
app.post('/api/users', (req, res) => {
  const incoming = req.body;
  if (!Array.isArray(incoming)) {
    return res.status(400).json({ error: 'Expected array of users' });
  }

  const sanitized = incoming.map((u: LeaderboardUser) => {
    const directCount = Math.max(0, parseInt(String(u.directCount), 10) || 0);
    const customBonus = Math.max(0, parseInt(String(u.customTicketBonus), 10) || 0);
    const explicitTickets = typeof u.ticketCount === 'number' && !isNaN(u.ticketCount) ? Math.max(0, Math.floor(u.ticketCount)) : null;
    const computedTickets = explicitTickets !== null ? explicitTickets : calculateTickets(directCount, customBonus);
    return {
      ...u,
      userId: (u.userId || '').trim().toUpperCase(),
      directCount,
      customTicketBonus: customBonus,
      ticketCount: computedTickets,
    };
  });

  cachedUsers = sortLeaderboard(sanitized);
  persistStore();
  broadcastLiveUpdate('sync');
  syncAllUsersToSupabase(cachedUsers);
  res.json({ success: true, version: dataVersion, users: cachedUsers });
});

// POST upgrade/add user directly on server
app.post('/api/users/upgrade', (req, res) => {
  const { userId, name, directCount, ticketCount, isAdditive } = req.body;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Valid userId required' });
  }

  const cleanId = userId.trim().toUpperCase();
  const existingIdx = cachedUsers.findIndex((u) => u.userId.toUpperCase() === cleanId);

  let updatedList = [...cachedUsers];
  let isNew = false;
  let targetUser: LeaderboardUser | null = null;

  if (existingIdx >= 0) {
    const curr = cachedUsers[existingIdx];
    let newDirect = curr.directCount;
    if (directCount !== undefined && directCount !== null) {
      const directNum = parseInt(String(directCount), 10) || 0;
      newDirect = Math.max(0, isAdditive ? curr.directCount + directNum : directNum);
    }

    let newTickets = curr.ticketCount;
    let customBonus = curr.customTicketBonus || 0;

    if (ticketCount !== undefined && ticketCount !== null) {
      const ticketNum = parseInt(String(ticketCount), 10) || 0;
      newTickets = Math.max(0, isAdditive ? curr.ticketCount + ticketNum : ticketNum);
      customBonus = Math.max(0, newTickets - Math.floor(newDirect / 5));
    } else {
      newTickets = calculateTickets(newDirect, customBonus);
    }

    const updatedUser: LeaderboardUser = {
      ...curr,
      name: name && typeof name === 'string' && name.trim() ? name.trim() : curr.name,
      directCount: newDirect,
      customTicketBonus: customBonus,
      ticketCount: newTickets,
      updatedAt: new Date().toISOString(),
    };
    updatedList[existingIdx] = updatedUser;
    targetUser = updatedUser;
  } else {
    isNew = true;
    let directs = 0;
    if (directCount !== undefined && directCount !== null) {
      directs = Math.max(0, parseInt(String(directCount), 10) || 0);
    }

    let tickets = 0;
    let customBonus = 0;
    if (ticketCount !== undefined && ticketCount !== null) {
      tickets = Math.max(0, parseInt(String(ticketCount), 10) || 0);
      customBonus = Math.max(0, tickets - Math.floor(directs / 5));
    } else {
      tickets = calculateTickets(directs, 0);
    }

    const newUser: LeaderboardUser = {
      id: `user-${Date.now()}`,
      userId: cleanId,
      name: name && typeof name === 'string' && name.trim() ? name.trim() : `Leader ${cleanId.slice(-4)}`,
      directCount: directs,
      customTicketBonus: customBonus,
      ticketCount: tickets,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updatedList.unshift(newUser);
    targetUser = newUser;
  }

  cachedUsers = sortLeaderboard(updatedList);
  persistStore();
  broadcastLiveUpdate('upgrade');
  if (targetUser) {
    syncUserToSupabase(targetUser);
  }

  const newRank = cachedUsers.findIndex((u) => u.userId.toUpperCase() === cleanId) + 1;
  res.json({ success: true, isNew, newRank, version: dataVersion, users: cachedUsers });
});

// POST edit an existing user (ID, Name, Directs, Tickets, Custom Bonus)
app.post('/api/users/edit', (req, res) => {
  const updated = req.body as LeaderboardUser;
  if (!updated || (!updated.id && !updated.userId)) {
    return res.status(400).json({ error: 'Valid user object required' });
  }

  const cleanId = updated.userId ? updated.userId.trim().toUpperCase() : '';
  const directNum = Math.max(0, parseInt(String(updated.directCount), 10) || 0);
  
  let finalTickets = 0;
  let finalBonus = Math.max(0, parseInt(String(updated.customTicketBonus), 10) || 0);

  if (typeof updated.ticketCount === 'number' && !isNaN(updated.ticketCount)) {
    finalTickets = Math.max(0, Math.floor(updated.ticketCount));
    finalBonus = Math.max(0, finalTickets - Math.floor(directNum / 5));
  } else {
    finalTickets = calculateTickets(directNum, finalBonus);
  }

  const recalculated: LeaderboardUser = {
    ...updated,
    userId: cleanId,
    name: updated.name ? updated.name.trim() : `Leader ${cleanId.slice(-4)}`,
    directCount: directNum,
    customTicketBonus: finalBonus,
    ticketCount: finalTickets,
    updatedAt: new Date().toISOString(),
  };

  const list = cachedUsers.map((u) => {
    if (u.id === recalculated.id || (cleanId && u.userId.toUpperCase() === cleanId)) {
      return recalculated;
    }
    return u;
  });
  cachedUsers = sortLeaderboard(list);
  persistStore();
  broadcastLiveUpdate('edit');
  syncUserToSupabase(recalculated);
  res.json({ success: true, version: dataVersion, users: cachedUsers });
});

// POST reset to initial contest members
app.post('/api/users/reset', (req, res) => {
  cachedUsers = sortLeaderboard(INITIAL_LEADERBOARD_USERS);
  persistStore();
  broadcastLiveUpdate('reset');
  syncAllUsersToSupabase(cachedUsers);
  res.json({ success: true, version: dataVersion, users: cachedUsers });
});

// DELETE remove a user by ID or userId
app.delete('/api/users/:id', (req, res) => {
  const targetId = req.params.id.trim().toUpperCase();
  cachedUsers = cachedUsers.filter(
    (u) => u.id !== req.params.id && u.userId.toUpperCase() !== targetId
  );
  persistStore();
  broadcastLiveUpdate('delete');
  deleteUserFromSupabase(targetId, req.params.id);
  res.json({ success: true, version: dataVersion, users: cachedUsers });
});

// Supabase Status & Schema Endpoints
app.get('/api/supabase/status', async (req, res) => {
  if (!supabaseServer) {
    return res.json({
      configured: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      connected: false,
      tableExists: false,
      count: 0,
      error: 'Supabase client not initialized',
    });
  }

  try {
    const { data, error, count } = await supabaseServer
      .from(SUPABASE_TABLE)
      .select('*', { count: 'exact', head: false })
      .limit(1);

    if (error) {
      return res.json({
        configured: true,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        connected: true,
        tableExists: false,
        count: 0,
        error: error.message,
      });
    }

    return res.json({
      configured: true,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      connected: true,
      tableExists: true,
      count: count ?? (data ? data.length : 0),
      error: null,
    });
  } catch (err: any) {
    return res.json({
      configured: true,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      connected: false,
      tableExists: false,
      count: 0,
      error: err?.message || 'Connection failed',
    });
  }
});

app.post('/api/supabase/seed', async (req, res) => {
  if (!supabaseServer) {
    return res.status(500).json({ error: 'Supabase client not initialized' });
  }
  await syncAllUsersToSupabase(cachedUsers);
  res.json({ success: true, count: cachedUsers.length });
});

// ==========================================
// VITE MIDDLEWARE / STATIC ASSETS
// ==========================================
async function startServer() {
  // Attempt to hydrate store from Supabase database
  await hydrateFromSupabase().catch((err) => {
    console.warn('[Supabase Server] Initial hydration note:', err);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
