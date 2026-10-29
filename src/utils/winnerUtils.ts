import { RewardWinner, WinnersSettings, LeaderboardUser } from '../types';

export const WINNERS_STORAGE_KEY = 'spay_winners_settings_v1';
export const WINNERS_BROADCAST_CHANNEL = 'spay_winners_sync_channel';

// Cash rewards reference according to official contest guidelines
export const DEFAULT_CASH_RANKS: { rank: number; title: string; value: string; badge: string }[] = [
  { rank: 1, title: '🥇 1st Prize: ₹51,000 Cash Reward', value: '₹51,000 Cash', badge: 'Grand Champion 🏆' },
  { rank: 2, title: '🥈 2nd Prize: ₹31,000 Cash Reward', value: '₹31,000 Cash', badge: 'Runner-up 🥈' },
  { rank: 3, title: '🥉 3rd Prize: ₹21,000 Cash Reward', value: '₹21,000 Cash', badge: '2nd Runner-up 🥉' },
  { rank: 4, title: '🎖️ 4th Prize: ₹11,000 Cash Reward', value: '₹11,000 Cash', badge: 'Elite Star' },
  { rank: 5, title: '🎖️ 5th Prize: ₹5,100 Cash Reward', value: '₹5,100 Cash', badge: 'Elite Star' },
  { rank: 6, title: '🎖️ 6th Prize: ₹3,100 Cash Reward', value: '₹3,100 Cash', badge: 'Top Achiever' },
  { rank: 7, title: '🎖️ 7th Prize: ₹2,100 Cash Reward', value: '₹2,100 Cash', badge: 'Top Achiever' },
  { rank: 8, title: '🎖️ 8th Prize: ₹1,500 Cash Reward', value: '₹1,500 Cash', badge: 'Top Achiever' },
  { rank: 9, title: '🎖️ 9th Prize: ₹1,100 Cash Reward', value: '₹1,100 Cash', badge: 'Top Achiever' },
  { rank: 10, title: '🎖️ 10th Prize: ₹1,100 Cash Reward', value: '₹1,100 Cash', badge: 'Top Achiever' },
];

export const INITIAL_DEFAULT_WINNERS: RewardWinner[] = [
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
];

export const DEFAULT_WINNERS_SETTINGS: WinnersSettings = {
  isVisible: true, // Default to visible so user can see it right away, admin can toggle OFF anytime
  title: '🏆 SmartPay 360 Official Rewards & Winners Announcement 🎊',
  announcementSubtitle: 'Live list of official contest prize winners (Top 10 Cash Rewards & Lucky Draw Prizes)',
  lastUpdated: new Date().toISOString(),
  winners: INITIAL_DEFAULT_WINNERS,
};

// Local storage helpers
export function getStoredWinnersSettings(): WinnersSettings {
  if (typeof window === 'undefined') return DEFAULT_WINNERS_SETTINGS;
  try {
    const raw = localStorage.getItem(WINNERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.isVisible === 'boolean' && Array.isArray(parsed.winners)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[WinnersStorage] Error reading localStorage:', e);
  }
  return DEFAULT_WINNERS_SETTINGS;
}

export function saveStoredWinnersSettings(settings: WinnersSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WINNERS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('[WinnersStorage] Error saving to localStorage:', e);
  }
}

// Multi-tab Broadcast Channel
let winnersChannel: BroadcastChannel | null = null;

export function broadcastWinnersChange(settings: WinnersSettings) {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
  try {
    if (!winnersChannel) {
      winnersChannel = new BroadcastChannel(WINNERS_BROADCAST_CHANNEL);
    }
    winnersChannel.postMessage({
      type: 'WINNERS_UPDATE',
      settings,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.warn('[WinnersBroadcast] Error broadcasting:', err);
  }
}

export function subscribeToWinnersBroadcasts(onUpdate: (settings: WinnersSettings) => void): () => void {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return () => {};
  }
  try {
    const channel = new BroadcastChannel(WINNERS_BROADCAST_CHANNEL);
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'WINNERS_UPDATE' && event.data.settings) {
        onUpdate(event.data.settings);
      }
    };
    channel.addEventListener('message', handler);
    return () => {
      channel.removeEventListener('message', handler);
      channel.close();
    };
  } catch (err) {
    console.warn('[WinnersBroadcast] Error subscribing:', err);
    return () => {};
  }
}

// API Helpers
export async function fetchWinnersFromApi(): Promise<WinnersSettings | null> {
  try {
    const res = await fetch(`/api/winners?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { Pragma: 'no-cache' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data.isVisible === 'boolean' && Array.isArray(data.winners)) {
      return data as WinnersSettings;
    }
  } catch (e) {
    console.warn('[WinnersApi] Failed to fetch winners:', e);
  }
  return null;
}

export async function saveWinnersToApi(settings: WinnersSettings): Promise<boolean> {
  try {
    const res = await fetch('/api/winners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.ok;
  } catch (e) {
    console.warn('[WinnersApi] Failed to post winners:', e);
    return false;
  }
}

export async function toggleWinnersVisibilityOnApi(isVisible: boolean): Promise<WinnersSettings | null> {
  try {
    const res = await fetch('/api/winners/toggle-visibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.settings;
    }
  } catch (e) {
    console.warn('[WinnersApi] Failed to toggle visibility:', e);
  }
  return null;
}

// Helper to auto-generate Top 10 winners based on current leaderboard users
export function generateWinnersFromTop10(users: LeaderboardUser[]): RewardWinner[] {
  const sorted = [...users].sort((a, b) => {
    if (b.ticketCount !== a.ticketCount) return b.ticketCount - a.ticketCount;
    return b.directCount - a.directCount;
  });

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return DEFAULT_CASH_RANKS.map((rankDef, index) => {
    const user = sorted[index];
    return {
      id: `win-top10-${rankDef.rank}-${Date.now()}`,
      userId: user ? user.userId : `PENDING_RANK_${rankDef.rank}`,
      name: user ? user.name : `Winner Position #${rankDef.rank}`,
      prizeCategory: 'cash_top10',
      rankOrPosition: rankDef.rank,
      prizeTitle: rankDef.title,
      prizeValue: rankDef.value,
      announcedDate: today,
      claimStatus: user ? 'VERIFIED' : 'PENDING',
      badgeNote: rankDef.badge,
    };
  });
}
