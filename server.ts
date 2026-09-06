import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_LEADERBOARD_USERS } from './src/data/initialData';
import { LeaderboardUser } from './src/types';
import { calculateTickets, sortLeaderboard } from './src/utils/leaderboardUtils';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Persistent store file path on container filesystem
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'leaderboard-store.json');

// In-memory cache for ultra-fast response
let cachedUsers: LeaderboardUser[] = [];
let dataVersion = Date.now();

// Set of active SSE (Server-Sent Events) client connections
const sseClients = new Set<express.Response>();

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

// ==========================================
// ANTI-CACHE & CORS MIDDLEWARE FOR ALL /api
// ==========================================
app.use('/api', (req, res, next) => {
  // Enforce zero caching across all browsers, mobile devices, and reverse proxies/CDNs
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  // Cross-Origin allowance
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Pragma');

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
  res.flushHeaders();

  // Send initial data immediately upon connecting
  const initialPayload = JSON.stringify({
    type: 'INITIAL',
    version: dataVersion,
    count: cachedUsers.length,
    users: cachedUsers,
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

// Health check with active live client count and version
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: dataVersion,
    count: cachedUsers.length,
    connectedClients: sseClients.size,
    timestamp: new Date().toISOString(),
  });
});

// GET all leaderboard users (always returns fresh data)
app.get('/api/users', (req, res) => {
  res.json(cachedUsers);
});

// POST replace all users
app.post('/api/users', (req, res) => {
  const incoming = req.body;
  if (!Array.isArray(incoming)) {
    return res.status(400).json({ error: 'Expected array of users' });
  }

  const sanitized = incoming.map((u: LeaderboardUser) => ({
    ...u,
    userId: (u.userId || '').trim().toUpperCase(),
    ticketCount: calculateTickets(u.directCount, u.customTicketBonus || 0),
  }));

  cachedUsers = sortLeaderboard(sanitized);
  persistStore();
  broadcastLiveUpdate('sync');
  res.json({ success: true, version: dataVersion, users: cachedUsers });
});

// POST upgrade/add user directly on server
app.post('/api/users/upgrade', (req, res) => {
  const { userId, name, directCount, isAdditive } = req.body;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Valid userId required' });
  }

  const cleanId = userId.trim().toUpperCase();
  const directNum = Math.max(0, parseInt(directCount, 10) || 0);
  const existingIdx = cachedUsers.findIndex((u) => u.userId.toUpperCase() === cleanId);

  let updatedList = [...cachedUsers];
  let isNew = false;

  if (existingIdx >= 0) {
    const curr = cachedUsers[existingIdx];
    const newDirect = isAdditive ? curr.directCount + directNum : directNum;
    const newTickets = calculateTickets(newDirect, curr.customTicketBonus || 0);

    const updatedUser: LeaderboardUser = {
      ...curr,
      name: name && typeof name === 'string' && name.trim() ? name.trim() : curr.name,
      directCount: Math.max(0, newDirect),
      ticketCount: newTickets,
      updatedAt: new Date().toISOString(),
    };
    updatedList[existingIdx] = updatedUser;
  } else {
    isNew = true;
    const newTickets = calculateTickets(directNum);
    const newUser: LeaderboardUser = {
      id: `user-${Date.now()}`,
      userId: cleanId,
      name: name && typeof name === 'string' && name.trim() ? name.trim() : `Leader ${cleanId.slice(-4)}`,
      directCount: directNum,
      ticketCount: newTickets,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updatedList.unshift(newUser);
  }

  cachedUsers = sortLeaderboard(updatedList);
  persistStore();
  broadcastLiveUpdate('upgrade');

  const newRank = cachedUsers.findIndex((u) => u.userId.toUpperCase() === cleanId) + 1;
  res.json({ success: true, isNew, newRank, version: dataVersion, users: cachedUsers });
});

// POST edit an existing user (ID, Name, Directs, Custom Bonus)
app.post('/api/users/edit', (req, res) => {
  const updated = req.body as LeaderboardUser;
  if (!updated || !updated.id) {
    return res.status(400).json({ error: 'Valid user object required' });
  }

  const cleanId = updated.userId ? updated.userId.trim().toUpperCase() : '';
  const recalculated: LeaderboardUser = {
    ...updated,
    userId: cleanId,
    name: updated.name ? updated.name.trim() : `Leader ${cleanId.slice(-4)}`,
    directCount: Math.max(0, updated.directCount || 0),
    customTicketBonus: Math.max(0, updated.customTicketBonus || 0),
    ticketCount: calculateTickets(updated.directCount, updated.customTicketBonus || 0),
    updatedAt: new Date().toISOString(),
  };

  const list = cachedUsers.map((u) => (u.id === recalculated.id ? recalculated : u));
  cachedUsers = sortLeaderboard(list);
  persistStore();
  broadcastLiveUpdate('edit');
  res.json({ success: true, version: dataVersion, users: cachedUsers });
});

// POST reset to initial 26 members
app.post('/api/users/reset', (req, res) => {
  cachedUsers = sortLeaderboard(INITIAL_LEADERBOARD_USERS);
  persistStore();
  broadcastLiveUpdate('reset');
  res.json({ success: true, version: dataVersion, users: cachedUsers });
});

// ==========================================
// VITE MIDDLEWARE / STATIC ASSETS
// ==========================================
async function startServer() {
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
