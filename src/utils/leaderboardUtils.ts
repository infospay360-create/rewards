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
  text += `💰 TOTAL CASH PRIZE: ₹10,750 (TOP 10)\n`;
  text += `🥇 Rank 1: ₹4,000 | 🥈 Rank 2: ₹2,000 | 🥉 Rank 3: ₹1,000\n`;
  text += `🏅 Rank 4: ₹750 | ⭐ Rank 5-10: ₹500 each\n\n`;
  text += `📅 LIVE TILL — 31 OCTOBER\n\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n`;
  text += `⚠️ IMPORTANT NOTICE\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `🔹 यह केवल CURRENT PERFORMANCE UPDATE है।\n`;
  text += `🔹 यह FINAL WINNER LIST नहीं है।\n`;
  text += `🔹 Performance के अनुसार ranking बदलती रहेगी।\n\n`;
  text += `🚀 DIRECT बढ़ाइए • TICKETS बढ़ाइए • CASH जीतिए\n`;
  text += `🏆 LEADERBOARD में TOP पर आइए!\n\n`;
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
  text += `🚀 TOP 10 में जगह बनाइए और पाइए शानदार CASH! 💰\n\n`;
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
  text += `🔥 TOP 10 में आइए • CASH जीतिए •\n`;
  text += `👥 5 DIRECT ➜ 🎟️ 1 TICKET\n\n`;
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

// Admin Authentication Helpers
export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PIN = 'admin360';

export function verifyAdminCredentials(username: string, pin: string): boolean {
  const u = username.trim().toLowerCase();
  const p = pin.trim();
  return (
    (u === 'admin' || u === 'spay360' || u === 'smartpay360' || u === 'spay360.info@gmail.com') &&
    (p === 'admin360' || p === '360' || p === '123456')
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
