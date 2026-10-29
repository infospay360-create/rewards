import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_LEADERBOARD_USERS } from './src/data/initialData';
import { LeaderboardUser, RewardWinner, WinnersSettings } from './src/types';
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

      // Also hydrate contest_winners_settings from Supabase
      try {
        const { data: winData, error: winErr } = await supabaseServer
          .from('contest_winners_settings')
          .select('*')
          .eq('id', 'current_winners')
          .maybeSingle();

        if (!winErr && winData) {
          cachedWinnersSettings = {
            isVisible: typeof winData.is_visible === 'boolean' ? winData.is_visible : true,
            title: winData.title || cachedWinnersSettings.title,
            announcementSubtitle: winData.announcement_subtitle || cachedWinnersSettings.announcementSubtitle,
            lastUpdated: winData.last_updated || new Date().toISOString(),
            winners: Array.isArray(winData.winners) ? winData.winners : cachedWinnersSettings.winners,
          };
          winnersVersion = Date.now();
          persistWinnersStore();
          console.log(`[Supabase Server] Hydrated winners from Supabase! (Visible: ${cachedWinnersSettings.isVisible})`);
        } else if (!winErr && !winData) {
          console.log('[Supabase Server] contest_winners_settings table is empty. Seeding initial winners...');
          await syncWinnersToSupabase(cachedWinnersSettings);
        }
      } catch (wErr) {
        console.warn('[Supabase Server] Winners hydrate note:', wErr);
      }

      return true;
    } else if (Array.isArray(data) && data.length === 0) {
      console.log('[Supabase Server] Table exists but empty. Seeding initial contest users...');
      await syncAllUsersToSupabase(cachedUsers);
      await syncWinnersToSupabase(cachedWinnersSettings);
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

// ==========================================
// UPDATE HISTORY LOG STORE (PERSISTENT ON DISK)
// ==========================================
const HISTORY_FILE = path.join(DATA_DIR, 'history-store.json');
let cachedHistory: any[] = [];

function getFormattedDate(d = new Date()) {
  try {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

function getFormattedTime(d = new Date()) {
  try {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  } catch {
    return d.toTimeString().slice(0, 8);
  }
}

function initHistoryStore(): void {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedHistory = parsed;
        console.log(`[HistoryStore] Loaded ${cachedHistory.length} history records.`);
        return;
      }
    }
    const now = new Date();
    cachedHistory = [
      {
        id: 'log-seed-1',
        timestamp: Date.now() - 1000 * 60 * 15,
        dateFormatted: getFormattedDate(new Date(Date.now() - 1000 * 60 * 15)),
        timeFormatted: getFormattedTime(new Date(Date.now() - 1000 * 60 * 15)),
        userId: 'SPAY330606',
        userName: 'Babla Paul',
        actionType: 'ADD_DIRECT',
        actionLabel: 'Direct Added (+1)',
        changeSummary: 'Directs increased: 3 ➔ 4 | Tickets: 0',
        previousDirects: 3,
        newDirects: 4,
        previousTickets: 0,
        newTickets: 0,
      },
      {
        id: 'log-seed-2',
        timestamp: Date.now() - 1000 * 60 * 50,
        dateFormatted: getFormattedDate(new Date(Date.now() - 1000 * 60 * 50)),
        timeFormatted: getFormattedTime(new Date(Date.now() - 1000 * 60 * 50)),
        userId: 'SPAY447004',
        userName: 'Suman Dey',
        actionType: 'UPGRADE',
        actionLabel: 'Contest Upgrade',
        changeSummary: 'Directs: 0 ➔ 1 | Tickets: 0',
        previousDirects: 0,
        newDirects: 1,
        previousTickets: 0,
        newTickets: 0,
      },
    ];
    persistHistoryStore();
  } catch (err) {
    console.warn('[HistoryStore] Init error:', err);
  }
}

function persistHistoryStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(cachedHistory.slice(0, 300), null, 2), 'utf-8');
  } catch (err) {
    console.error('[HistoryStore] Failed to save history:', err);
  }
}

function addHistoryRecord(entry: any) {
  const now = new Date();
  const newLog = {
    id: entry.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: entry.timestamp || Date.now(),
    dateFormatted: entry.dateFormatted || getFormattedDate(now),
    timeFormatted: entry.timeFormatted || getFormattedTime(now),
    userId: String(entry.userId || '').toUpperCase(),
    userName: String(entry.userName || 'Unknown'),
    actionType: entry.actionType || 'UPGRADE',
    actionLabel: entry.actionLabel || 'Contest Update',
    changeSummary: String(entry.changeSummary || ''),
    previousDirects: typeof entry.previousDirects === 'number' ? entry.previousDirects : undefined,
    newDirects: typeof entry.newDirects === 'number' ? entry.newDirects : undefined,
    previousTickets: typeof entry.previousTickets === 'number' ? entry.previousTickets : undefined,
    newTickets: typeof entry.newTickets === 'number' ? entry.newTickets : undefined,
  };
  cachedHistory.unshift(newLog);
  if (cachedHistory.length > 300) cachedHistory = cachedHistory.slice(0, 300);
  persistHistoryStore();
  broadcastHistoryUpdate(cachedHistory);
  return newLog;
}

function broadcastHistoryUpdate(historyLogs: any[]) {
  const payload = JSON.stringify({
    type: 'HISTORY_UPDATED',
    history: historyLogs,
  });
  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

// ==========================================
// REWARDS WINNER STORE (PERSISTENT ON DISK)
// ==========================================
const WINNERS_FILE = path.join(DATA_DIR, 'winners-store.json');
let winnersVersion = Date.now();
let cachedWinnersSettings: WinnersSettings = {
  isVisible: true,
  title: '🏆 SmartPay 360 Official Rewards & Winners Announcement 🎊',
  announcementSubtitle: 'Live list of official contest prize winners (Top 10 Cash Rewards & Lucky Draw Prizes)',
  lastUpdated: new Date().toISOString(),
  winners: [
    {
      id: 'win-1',
      userId: 'SPAY330606',
      name: 'Babla Paul',
      prizeCategory: 'cash_top10',
      rankOrPosition: 1,
      prizeTitle: '🥇 1st Prize: ₹51,000 Guaranteed Cash',
      prizeValue: '₹51,000 Cash',
      announcedDate: '29 Oct 2026',
      claimStatus: 'VERIFIED',
      badgeNote: 'Grand Champion 🏆',
    },
    {
      id: 'win-2',
      userId: 'SPAY447004',
      name: 'Suman Dey',
      prizeCategory: 'cash_top10',
      rankOrPosition: 2,
      prizeTitle: '🥈 2nd Prize: ₹31,000 Guaranteed Cash',
      prizeValue: '₹31,000 Cash',
      announcedDate: '29 Oct 2026',
      claimStatus: 'VERIFIED',
      badgeNote: 'Rank 2 Star 🥈',
    },
    {
      id: 'win-3',
      userId: 'SPAY411819',
      name: 'Leader One',
      prizeCategory: 'cash_top10',
      rankOrPosition: 3,
      prizeTitle: '🥉 3rd Prize: ₹21,000 Guaranteed Cash',
      prizeValue: '₹21,000 Cash',
      announcedDate: '29 Oct 2026',
      claimStatus: 'DISBURSED',
      badgeNote: 'Rank 3 Winner 🥉',
    },
    {
      id: 'win-4',
      userId: 'SPAY512990',
      name: 'Rajesh Sharma',
      prizeCategory: 'lucky_draw',
      rankOrPosition: 'Lucky Draw #1',
      prizeTitle: '🎁 Lucky Draw: Android 5G Smartphone',
      prizeValue: 'Android Smartphone',
      announcedDate: '29 Oct 2026',
      claimStatus: 'PENDING',
      badgeNote: 'Lucky Draw 📱',
    },
    {
      id: 'win-5',
      userId: 'SPAY620112',
      name: 'Pooja Verma',
      prizeCategory: 'lucky_draw',
      rankOrPosition: 'Lucky Draw #2',
      prizeTitle: '🎁 Lucky Draw: 32" HD Smart TV',
      prizeValue: '32" Smart LED TV',
      announcedDate: '29 Oct 2026',
      claimStatus: 'VERIFIED',
      badgeNote: 'Mega Gift 📺',
    },
  ],
};

async function syncWinnersToSupabase(settings: WinnersSettings) {
  if (!supabaseServer) return;
  try {
    const row = {
      id: 'current_winners',
      is_visible: settings.isVisible,
      title: settings.title,
      announcement_subtitle: settings.announcementSubtitle || '',
      last_updated: settings.lastUpdated || new Date().toISOString(),
      winners: settings.winners || [],
    };
    const { error } = await supabaseServer
      .from('contest_winners_settings')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase Server] Winners sync error:', error.message);
    } else {
      console.log(`[Supabase Server] Synced contest_winners_settings to Supabase (Visible: ${settings.isVisible})`);
    }

    if (Array.isArray(settings.winners) && settings.winners.length > 0) {
      try {
        const indRows = settings.winners.map((w) => ({
          id: w.id || `win-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          user_id: String(w.userId || '').toUpperCase(),
          name: w.name,
          prize_category: w.prizeCategory,
          rank_or_position: String(w.rankOrPosition),
          prize_title: w.prizeTitle,
          prize_value: w.prizeValue,
          announced_date: w.announcedDate || new Date().toISOString().split('T')[0],
          claim_status: w.claimStatus || 'VERIFIED',
          badge_note: w.badgeNote || '',
          updated_at: new Date().toISOString(),
        }));
        await supabaseServer
          .from('contest_winners')
          .upsert(indRows, { onConflict: 'id' });
      } catch (indErr) {
        console.warn('[Supabase Server] Ind winners sync note:', indErr);
      }
    }
  } catch (err) {
    console.warn('[Supabase Server] Winners sync exception:', err);
  }
}

function initWinnersStore(): void {
  try {
    if (fs.existsSync(WINNERS_FILE)) {
      const raw = fs.readFileSync(WINNERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.isVisible === 'boolean' && Array.isArray(parsed.winners)) {
        cachedWinnersSettings = parsed;
        winnersVersion = Date.now();
        console.log(`[WinnersStore] Loaded ${cachedWinnersSettings.winners.length} winners (Visible: ${cachedWinnersSettings.isVisible})`);
        return;
      }
    }
    persistWinnersStore();
  } catch (err) {
    console.warn('[WinnersStore] Init error:', err);
  }
}

function persistWinnersStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(WINNERS_FILE, JSON.stringify(cachedWinnersSettings, null, 2), 'utf-8');
  } catch (err) {
    console.error('[WinnersStore] Failed to save winners:', err);
  }
}

function broadcastWinnersUpdate(settings: WinnersSettings) {
  winnersVersion = Date.now();
  const payload = JSON.stringify({
    type: 'WINNERS_UPDATED',
    winnersVersion,
    settings,
    winners: settings,
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

// Initialize stores at startup
initStore();
initThemeStore();
initHistoryStore();
initWinnersStore();

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
    history: cachedHistory,
    winners: cachedWinnersSettings,
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
    winnersVersion: winnersVersion,
    theme: cachedTheme,
    winners: cachedWinnersSettings,
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

    // Record History Log for update
    let actionType: 'ADD_DIRECT' | 'MINUS_DIRECT' | 'UPGRADE' = 'UPGRADE';
    let actionLabel = 'Contest Upgrade';
    if (isAdditive && typeof directCount === 'number') {
      if (directCount > 0) {
        actionType = 'ADD_DIRECT';
        actionLabel = `Direct Added (+${directCount})`;
      } else if (directCount < 0) {
        actionType = 'MINUS_DIRECT';
        actionLabel = `Direct Reduced (${directCount})`;
      }
    }
    const diffTickets = newTickets - curr.ticketCount;
    const ticketSummary = diffTickets !== 0 ? ` | Tickets: ${curr.ticketCount} ➔ ${newTickets}` : ` | Tickets: ${newTickets}`;
    const summary = `Directs: ${curr.directCount} ➔ ${newDirect}${ticketSummary}`;
    addHistoryRecord({
      userId: cleanId,
      userName: updatedUser.name,
      actionType,
      actionLabel,
      changeSummary: summary,
      previousDirects: curr.directCount,
      newDirects: newDirect,
      previousTickets: curr.ticketCount,
      newTickets: newTickets,
    });
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

    // Record History Log for new user
    addHistoryRecord({
      userId: cleanId,
      userName: newUser.name,
      actionType: 'NEW_USER',
      actionLabel: 'New Contestant Registered',
      changeSummary: `Registered with ${directs} Directs | ${tickets} Tickets`,
      previousDirects: 0,
      newDirects: directs,
      previousTickets: 0,
      newTickets: tickets,
    });
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

  const oldUser = cachedUsers.find((u) => u.id === recalculated.id || (cleanId && u.userId.toUpperCase() === cleanId));

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

  // Record History Log for Edit
  addHistoryRecord({
    userId: cleanId,
    userName: recalculated.name,
    actionType: 'EDIT',
    actionLabel: 'Details Edited',
    changeSummary: `Directs: ${oldUser ? oldUser.directCount : 0} ➔ ${directNum} | Tickets: ${oldUser ? oldUser.ticketCount : 0} ➔ ${finalTickets}`,
    previousDirects: oldUser?.directCount,
    newDirects: directNum,
    previousTickets: oldUser?.ticketCount,
    newTickets: finalTickets,
  });

  res.json({ success: true, version: dataVersion, users: cachedUsers });
});

// POST reset to initial contest members
app.post('/api/users/reset', (req, res) => {
  cachedUsers = sortLeaderboard(INITIAL_LEADERBOARD_USERS);
  persistStore();
  broadcastLiveUpdate('reset');
  syncAllUsersToSupabase(cachedUsers);

  // Record History Log for Reset
  addHistoryRecord({
    userId: 'SYSTEM',
    userName: 'Admin Snapshot Reset',
    actionType: 'RESET',
    actionLabel: 'Contest Reset',
    changeSummary: 'Leaderboard restored to initial contest state',
  });

  res.json({ success: true, version: dataVersion, users: cachedUsers });
});

// DELETE remove a user by ID or userId
app.delete('/api/users/:id', (req, res) => {
  const targetId = req.params.id.trim().toUpperCase();
  const existing = cachedUsers.find(
    (u) => u.id === req.params.id || u.userId.toUpperCase() === targetId
  );
  cachedUsers = cachedUsers.filter(
    (u) => u.id !== req.params.id && u.userId.toUpperCase() !== targetId
  );
  persistStore();
  broadcastLiveUpdate('delete');
  deleteUserFromSupabase(targetId, req.params.id);

  // Record History Log for Delete
  addHistoryRecord({
    userId: targetId,
    userName: existing ? existing.name : targetId,
    actionType: 'DELETE',
    actionLabel: 'User Removed',
    changeSummary: `Removed contestant ${existing ? existing.name : targetId} (${targetId})`,
  });

  res.json({ success: true, version: dataVersion, users: cachedUsers });
});

// ==========================================
// UPDATE HISTORY API ROUTES
// ==========================================
app.get('/api/history', (req, res) => {
  res.json({
    count: cachedHistory.length,
    history: cachedHistory,
  });
});

app.post('/api/history', (req, res) => {
  const entry = req.body;
  if (!entry || typeof entry !== 'object') {
    return res.status(400).json({ error: 'Valid history log object required' });
  }
  const saved = addHistoryRecord(entry);
  res.json({ success: true, log: saved, history: cachedHistory });
});

app.post('/api/history/clear', (req, res) => {
  cachedHistory = [];
  persistHistoryStore();
  broadcastHistoryUpdate([]);
  res.json({ success: true, history: [] });
});

// ==========================================
// REWARDS WINNERS API ROUTES
// ==========================================
app.get('/api/winners', (req, res) => {
  res.json(cachedWinnersSettings);
});

app.post('/api/winners', (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Valid winners object required' });
  }

  const isVisible = typeof body.isVisible === 'boolean' ? body.isVisible : cachedWinnersSettings.isVisible;
  const title = body.title && typeof body.title === 'string' ? body.title : cachedWinnersSettings.title;
  const announcementSubtitle = typeof body.announcementSubtitle === 'string' ? body.announcementSubtitle : cachedWinnersSettings.announcementSubtitle;
  const winnersList = Array.isArray(body.winners) ? body.winners : cachedWinnersSettings.winners;

  cachedWinnersSettings = {
    isVisible,
    title,
    announcementSubtitle,
    lastUpdated: new Date().toISOString(),
    winners: winnersList,
  };

  persistWinnersStore();
  broadcastWinnersUpdate(cachedWinnersSettings);
  syncWinnersToSupabase(cachedWinnersSettings);

  // Also log into update history if admin updated winners
  addHistoryRecord({
    userId: 'ADMIN',
    userName: 'Admin Winners Portal',
    actionType: 'UPGRADE',
    actionLabel: isVisible ? 'Winners List Published' : 'Winners List Hidden',
    changeSummary: `Total Winners: ${winnersList.length} | Display: ${isVisible ? 'LIVE ON SITE' : 'HIDDEN'}`,
  });

  res.json({ success: true, settings: cachedWinnersSettings });
});

app.post('/api/winners/toggle-visibility', (req, res) => {
  const { isVisible } = req.body;
  if (typeof isVisible !== 'boolean') {
    return res.status(400).json({ error: 'isVisible boolean required' });
  }

  cachedWinnersSettings = {
    ...cachedWinnersSettings,
    isVisible,
    lastUpdated: new Date().toISOString(),
  };

  persistWinnersStore();
  broadcastWinnersUpdate(cachedWinnersSettings);
  syncWinnersToSupabase(cachedWinnersSettings);

  addHistoryRecord({
    userId: 'ADMIN',
    userName: 'Admin Winners Portal',
    actionType: 'EDIT',
    actionLabel: isVisible ? 'Winners Banner Activated' : 'Winners Banner Deactivated',
    changeSummary: `Public display state toggled to: ${isVisible ? 'LIVE (SHOW)' : 'HIDDEN'}`,
  });

  res.json({ success: true, settings: cachedWinnersSettings });
});

app.post('/api/supabase/seed-winners', async (req, res) => {
  await syncWinnersToSupabase(cachedWinnersSettings);
  res.json({ success: true, winners: cachedWinnersSettings });
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

app.post('/api/supabase/config', (req, res) => {
  const { url, anonKey, projectId } = req.body;
  if (!url || !anonKey) {
    return res.status(400).json({ error: 'url and anonKey are required' });
  }
  try {
    supabaseServer = createClient(url.trim(), anonKey.trim(), {
      auth: { persistSession: false },
    });
    console.log('[Supabase Server] Reconfigured client with URL:', url);
    res.json({ success: true, message: 'Supabase client updated on server' });
  } catch (err: any) {
    console.error('[Supabase Server] Failed to reconfigure client:', err);
    res.status(500).json({ error: err.message || 'Failed to initialize Supabase client' });
  }
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
