import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_LEADERBOARD_USERS } from './src/data/initialData';
import { LeaderboardUser } from './src/types';
import { calculateTickets, sortLeaderboard } from './src/utils/leaderboardUtils';

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent store file path
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'leaderboard-store.json');

// In-memory cache
let cachedUsers: LeaderboardUser[] = [];

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
        console.log(`[Store] Loaded ${cachedUsers.length} users from disk.`);
        return;
      }
    }

    // Seed with initial data
    cachedUsers = sortLeaderboard(INITIAL_LEADERBOARD_USERS);
    fs.writeFileSync(DATA_FILE, JSON.stringify(cachedUsers, null, 2), 'utf-8');
    console.log(`[Store] Initialized store with ${cachedUsers.length} default users.`);
  } catch (err) {
    console.error('[Store] Error initializing store:', err);
    cachedUsers = sortLeaderboard(INITIAL_LEADERBOARD_USERS);
  }
}

function persistStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(cachedUsers, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Store] Failed to write to disk:', err);
  }
}

// Initialize store at startup
initStore();

// ==========================================
// API ROUTES (Must come before Vite middleware)
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', count: cachedUsers.length, timestamp: new Date().toISOString() });
});

// GET all leaderboard users (synced across all devices)
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
    ticketCount: calculateTickets(u.directCount, u.customTicketBonus || 0),
  }));

  cachedUsers = sortLeaderboard(sanitized);
  persistStore();
  res.json({ success: true, users: cachedUsers });
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

  const newRank = cachedUsers.findIndex((u) => u.userId.toUpperCase() === cleanId) + 1;
  res.json({ success: true, isNew, newRank, users: cachedUsers });
});

// POST edit an existing user
app.post('/api/users/edit', (req, res) => {
  const updated = req.body as LeaderboardUser;
  if (!updated || !updated.id) {
    return res.status(400).json({ error: 'Valid user object required' });
  }

  const recalculated: LeaderboardUser = {
    ...updated,
    userId: updated.userId ? updated.userId.trim().toUpperCase() : '',
    ticketCount: calculateTickets(updated.directCount, updated.customTicketBonus || 0),
    updatedAt: new Date().toISOString(),
  };

  const list = cachedUsers.map((u) => (u.id === recalculated.id ? recalculated : u));
  cachedUsers = sortLeaderboard(list);
  persistStore();
  res.json({ success: true, users: cachedUsers });
});

// POST reset to initial 26 members
app.post('/api/users/reset', (req, res) => {
  cachedUsers = sortLeaderboard(INITIAL_LEADERBOARD_USERS);
  persistStore();
  res.json({ success: true, users: cachedUsers });
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
