import { LeaderboardUser } from '../types';
import { INITIAL_LEADERBOARD_USERS } from '../data/initialData';

const STORAGE_KEY = 'smartpay360_leaderboard_v1';
const ADMIN_AUTH_KEY = 'smartpay360_admin_session_v1';

export const TOP_10_CASH_PRIZES: Record<number, { amount: number; formatted: string; badge: string }> = {
  1: { amount: 4000, formatted: '₹4,000', badge: '🥇 TOP 1' },
  2: { amount: 2000, formatted: '₹2,000', badge: '🥈 TOP 2' },
  3: { amount: 1000, formatted: '₹1,000', badge: '🥉 TOP 3' },
  4: { amount: 750, formatted: '₹750', badge: '🏅 TOP 4' },
  5: { amount: 500, formatted: '₹500', badge: '⭐ TOP 5' },
  6: { amount: 500, formatted: '₹500', badge: '⭐ TOP 6' },
  7: { amount: 500, formatted: '₹500', badge: '⭐ TOP 7' },
  8: { amount: 500, formatted: '₹500', badge: '⭐ TOP 8' },
  9: { amount: 500, formatted: '₹500', badge: '⭐ TOP 9' },
  10: { amount: 500, formatted: '₹500', badge: '⭐ TOP 10' },
};

export const TOTAL_CASH_POOL = 10750; // 4000 + 2000 + 1000 + 750 + 500*6

export function getCashPrizeForRank(rank: number): { amount: number; formatted: string; badge: string } | null {
  return TOP_10_CASH_PRIZES[rank] || null;
}

export function calculateTickets(directCount: number, bonus = 0): number {
  const calculated = Math.floor(Math.max(0, directCount) / 5);
  return calculated + (bonus || 0);
}

export function calculateProgressToNextTicket(directCount: number): {
  needed: number;
  currentInCycle: number;
  percentage: number;
} {
  const currentInCycle = directCount % 5;
  const needed = currentInCycle === 0 && directCount > 0 ? 5 : 5 - currentInCycle;
  const percentage = (currentInCycle / 5) * 100;
  return { needed, currentInCycle, percentage };
}

export function sortLeaderboard(users: LeaderboardUser[]): LeaderboardUser[] {
  return [...users].sort((a, b) => {
    // 1. Higher ticket count first
    if (b.ticketCount !== a.ticketCount) {
      return b.ticketCount - a.ticketCount;
    }
    // 2. Higher direct count first
    if (b.directCount !== a.directCount) {
      return b.directCount - a.directCount;
    }
    // 3. User ID or earlier creation
    return a.userId.localeCompare(b.userId);
  });
}

export function getRankBadge(rank: number): { emoji: string; label: string; bgClass: string; textClass: string; borderClass: string } {
  if (rank === 1) {
    return {
      emoji: '🥇',
      label: 'Rank 1 (Gold)',
      bgClass: 'bg-amber-500/15',
      textClass: 'text-amber-400',
      borderClass: 'border-amber-400/40 shadow-amber-500/10'
    };
  }
  if (rank === 2) {
    return {
      emoji: '🥈',
      label: 'Rank 2 (Silver)',
      bgClass: 'bg-slate-300/15',
      textClass: 'text-slate-200',
      borderClass: 'border-slate-300/40 shadow-slate-400/10'
    };
  }
  if (rank === 3) {
    return {
      emoji: '🥉',
      label: 'Rank 3 (Bronze)',
      bgClass: 'bg-amber-700/15',
      textClass: 'text-amber-500',
      borderClass: 'border-amber-600/40 shadow-amber-700/10'
    };
  }
  if (rank <= 6) {
    return {
      emoji: '🏅',
      label: `Rank ${rank}`,
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-400',
      borderClass: 'border-emerald-500/30'
    };
  }
  return {
    emoji: '⭐',
    label: `Rank ${rank}`,
    bgClass: 'bg-slate-800/40',
    textClass: 'text-indigo-300',
    borderClass: 'border-slate-700/50'
  };
}

export function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

export function generateWhatsAppBroadcast(users: LeaderboardUser[]): string {
  const sorted = sortLeaderboard(users);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  let text = `🔥🏆 SMARTPAY360 | LIVE TICKET LEADERBOARD 🏆🔥\n\n`;
  text += `╔══════════════════════════╗\n`;
  text += `📊 CURRENT PERFORMANCE (${dateStr} • ${timeStr})\n`;
  text += `╚══════════════════════════╝\n\n`;
  text += `👤 USER ID | 👥 DIRECT | 🎟️ TICKET | 💰 CASH\n\n`;

  sorted.forEach((user, index) => {
    const rankNum = index + 1;
    const rankStr = padZero(rankNum);
    const badge = rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : rankNum === 3 ? '🥉' : rankNum <= 6 ? '🏅' : '⭐';
    const directStr = padZero(user.directCount);
    const ticketStr = padZero(user.ticketCount);
    const prize = getCashPrizeForRank(rankNum);
    const prizeStr = prize ? ` | 💵 ${prize.formatted}` : '';

    text += `${badge} ${rankStr} ➜ ${user.userId}  👥 ${directStr} | 🎟️ ${ticketStr}${prizeStr}\n`;
    if (rankNum === 2 || rankNum === 6 || rankNum === 10) {
      text += `\n`;
    }
  });

  text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🎯 TICKET REWARD & TOP 10 CASH\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `👥 5 DIRECT ➜ 🎟️ 1 TICKET\n`;
  text += `💰 CASH REWARDS PRIZE POOL (TOP 10)\n`;
  text += `🥇 Rank 1: ₹4,000 | 🥈 Rank 2: ₹2,000 | 🥉 Rank 3: ₹1,000\n`;
  text += `🏅 Rank 4: ₹750 | ⭐ Rank 5-10: ₹500 each\n\n`;
  text += `📅 LIVE TILL — 31 OCTOBER\n\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n`;
  text += `⚠️ IMPORTANT NOTICE\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `🔹 This is strictly a CURRENT PERFORMANCE UPDATE.\n`;
  text += `🔹 This is NOT THE FINAL WINNER LIST.\n`;
  text += `🔹 Rankings update in real time based on active direct referrals.\n\n`;
  text += `🚀 BOOST DIRECTS • MULTIPLY TICKETS • WIN CASH\n`;
  text += `🏆 REACH THE TOP OF THE LEADERBOARD!\n\n`;
  text += `❤️ SMARTPAY360\n`;
  text += `✨ KEEP ACHIEVING • KEEP GROWING ✨\n`;

  return text;
}

export function generateTop10CashBroadcast(users: LeaderboardUser[]): string {
  const sorted = sortLeaderboard(users);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  let text = `🔥🏆 SMARTPAY360 | TOP 10 CASH 🏆🔥\n\n`;
  text += `💎 PERFORM • RANK • WIN!\n`;
  text += `🚀 Secure your rank in the Top 10 to earn guaranteed CASH prizes! 💰\n\n`;
  text += `╔══════════════════════════╗\n`;
  text += `💰 TOP 10 CASH DISTRIBUTION (${dateStr})\n`;
  text += `╚══════════════════════════╝\n\n`;

  const top10 = sorted.slice(0, 10);

  top10.forEach((user, index) => {
    const rankNum = index + 1;
    const prize = getCashPrizeForRank(rankNum);
    const medal = rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : rankNum === 3 ? '🥉' : rankNum === 4 ? '🏅' : '⭐';
    text += `${medal} TOP ${rankNum} ➜ ${user.userId} (👥 ${padZero(user.directCount)} | 🎟️ ${padZero(user.ticketCount)}) ➜ 💵 ${prize?.formatted} CASH\n\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `🔥 ENTER THE TOP 10 • WIN GUARANTEED CASH •\n`;
  text += `👥 5 DIRECTS ➜ 🎟️ 1 TICKET\n\n`;
  text += `❤️ SMARTPAY360\n`;
  text += `✨ KEEP ACHIEVING • KEEP GROWING ✨\n`;

  return text;
}

export function generateLuckyDraw40Broadcast(users: LeaderboardUser[]): string {
  const sorted = sortLeaderboard(users);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const REAL_GIFTS = [
    'WASHING MACHINE',
    'SPORTS BICYCLE',
    'MIXER GRINDER',
    '5Ltr PRESTIGE PRESSURE COOKER',
    'GAS STOVE',
    'BLUETOOTH SOUND SYSTEM',
    'COOKWARE SET',
    'NOKIA KEYPAD PHONE',
    'AMBRANE POWER BANK',
    'FASTRACK SUNGLASSES',
  ];

  let text = `🪔🏆 SMARTPAY360 | FESTIVE LUCKY DRAW 🏆🪔\n\n`;
  text += `ACHIEVE MORE • EARN MORE • WIN BIG!\n`;
  text += `🎁 TOTAL 40 MEGA PRIZES • 1 SEP TO 31 OCT\n\n`;
  text += `╔══════════════════════════╗\n`;
  text += `📊 CURRENT PERFORMANCE (${dateStr})\n`;
  text += `╚══════════════════════════╝\n\n`;
  text += `👤 USER ID | 👥 DIRECT | 🎟️ TICKET | 🎁 PRIZE\n\n`;

  REAL_GIFTS.forEach((giftName, idx) => {
    const rankNum = idx + 1;
    const medal = rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : rankNum === 3 ? '🥉' : rankNum <= 6 ? '🏅' : '⭐';
    const user = sorted[idx];
    const userStr = user ? `${user.userId} (👥 ${padZero(user.directCount)} | 🎟️ ${padZero(user.ticketCount)})` : 'Open Spot';
    text += `${medal} Rank ${padZero(rankNum)} ➜ 🎁 ${giftName}\n   ➜ ${userStr}\n\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━\n`;
  text += `💵 11th to 20th ➜ E-WALLET ₹500 (10 Winners)\n`;
  text += `💵 21st to 40th ➜ E-WALLET ₹250 (20 Winners)\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `👕 SPECIAL OFFER: FREE BRANDED T-SHIRT ON 1ST 5 DIRECTS!\n`;
  text += `🎟️ TICKET RULE: EVERY 5 DIRECTS EARNS 1 LUCKY DRAW TICKET!\n`;
  text += `🔥 Members with higher ticket counts have greater chances to win these mega prizes!\n\n`;
  text += `❤️ SMARTPAY360\n`;
  text += `✨ KEEP ACHIEVING • KEEP GROWING ✨\n`;

  return text;
}

export function loadUsersFromStorage(): LeaderboardUser[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((u: LeaderboardUser) => ({
          ...u,
          ticketCount: calculateTickets(u.directCount, u.customTicketBonus || 0),
        }));
      }
    }
  } catch (err) {
    console.error('Error reading localStorage:', err);
  }
  return INITIAL_LEADERBOARD_USERS;
}

export function saveUsersToStorage(users: LeaderboardUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

// Cross-tab and Cross-window BroadcastChannel for instant 0ms local sync
const liveBroadcastChannel =
  typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('smartpay360_live_sync')
    : null;

export function broadcastToOtherTabs(users: LeaderboardUser[], version = Date.now()) {
  try {
    liveBroadcastChannel?.postMessage({
      type: 'USERS_UPDATED',
      version,
      users,
    });
  } catch {
    // Ignore channel broadcast errors
  }
}

export function subscribeToTabBroadcasts(callback: (users: LeaderboardUser[]) => void): () => void {
  if (!liveBroadcastChannel) return () => {};
  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type === 'USERS_UPDATED' && Array.isArray(event.data.users)) {
      callback(sortLeaderboard(event.data.users));
    }
  };
  liveBroadcastChannel.addEventListener('message', handler);
  return () => {
    liveBroadcastChannel.removeEventListener('message', handler);
  };
}

// Server API Synchronization Helpers (Cross-device, multi-browser persistence)
export async function fetchUsersFromApi(): Promise<{ users: LeaderboardUser[]; version: number } | null> {
  try {
    const timestamp = Date.now();
    const res = await fetch(`/api/users?_t=${timestamp}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      return { users: sortLeaderboard(data), version: timestamp };
    }
    if (data && Array.isArray(data.users)) {
      return { users: sortLeaderboard(data.users), version: data.version || timestamp };
    }
  } catch (err) {
    console.warn('[API] Failed to fetch users from server:', err);
  }
  return null;
}

export async function fetchVersionFromApi(): Promise<number | null> {
  try {
    const timestamp = Date.now();
    const res = await fetch(`/api/version?_t=${timestamp}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.version ? data.version : null;
  } catch {
    return null;
  }
}

export async function syncUsersToApi(users: LeaderboardUser[]): Promise<boolean> {
  try {
    const res = await fetch(`/api/users?_t=${Date.now()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(users),
    });
    return res.ok;
  } catch (err) {
    console.error('[API] Failed to sync users to server:', err);
    return false;
  }
}

export async function upgradeUserOnApi(data: {
  userId: string;
  name?: string;
  directCount: number;
  isAdditive?: boolean;
}): Promise<{ success: boolean; users?: LeaderboardUser[]; isNew?: boolean; newRank?: number } | null> {
  try {
    const res = await fetch(`/api/users/upgrade?_t=${Date.now()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const resp = await res.json();
      return {
        ...resp,
        users: resp.users ? sortLeaderboard(resp.users) : undefined,
      };
    }
  } catch (err) {
    console.error('[API] Failed to upgrade user on server:', err);
  }
  return null;
}

export async function editUserOnApi(user: LeaderboardUser): Promise<LeaderboardUser[] | null> {
  try {
    const res = await fetch(`/api/users/edit?_t=${Date.now()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    if (res.ok) {
      const data = await res.json();
      return data.users ? sortLeaderboard(data.users) : null;
    }
  } catch (err) {
    console.error('[API] Failed to edit user on server:', err);
  }
  return null;
}

export async function resetUsersOnApi(): Promise<LeaderboardUser[] | null> {
  try {
    const res = await fetch(`/api/users/reset?_t=${Date.now()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data.users ? sortLeaderboard(data.users) : null;
    }
  } catch (err) {
    console.error('[API] Failed to reset users on server:', err);
  }
  return null;
}

// Admin Authentication Helpers
export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PIN = 'admin';

export function verifyAdminCredentials(username: string, pin: string): boolean {
  const u = username.trim().toLowerCase();
  const p = pin.trim().toLowerCase();
  return (
    (u === 'admin' || u === 'spay360' || u === 'smartpay360' || u === 'spay360.info@gmail.com') &&
    (p === 'admin' || p === 'admin360' || p === '360' || p === '123456')
  );
}

export function checkAdminSession(): boolean {
  try {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveAdminSession(isAuthenticated: boolean): void {
  try {
    if (isAuthenticated) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    }
  } catch (err) {
    console.error('Error persisting admin session', err);
  }
}
