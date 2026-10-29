export interface LeaderboardUser {
  id: string; // unique internal key
  userId: string; // e.g. "SPAY411819"
  name: string; // e.g. "Leader One" or user provided name
  directCount: number; // total direct referrals
  ticketCount: number; // auto-calculated (Math.floor(directCount / 5)) + customTicketBonus
  customTicketBonus?: number; // optional manual bonus tickets if any
  createdAt: string;
  updatedAt: string;
}

export interface CashPrize {
  rank: number;
  amount: number;
  label: string;
  formatted: string;
  badge: string;
}

export interface LuckyDrawPrize {
  rank: number;
  rankLabel: string;
  title: string;
  category: 'real_gift' | 'wallet_cash' | 'special_bonus';
  detail: string;
  iconType: string;
  badgeColor: string;
  isRealGift: boolean;
}

export type FilterCategory = 'all' | 'top10' | 'ticket_holders' | 'near_ticket';
export type SortOption = 'rank' | 'directs_desc' | 'tickets_desc' | 'recent';

export interface AdminCredentials {
  username: string;
  pin: string;
}

export type BackgroundPresetId =
  | 'smartpay_official'
  | 'smartpay_dark_emerald'
  | 'midnight_gold'
  | 'royal_navy'
  | 'emerald_matrix'
  | 'titanium_onyx'
  | 'burgundy_ruby'
  | 'cyber_violet'
  | 'ocean_teal'
  | 'stealth_dark'
  | 'custom';

export type PatternStyle = 'dots' | 'grid' | 'mesh' | 'none';
export type GlowIntensity = 'vibrant' | 'subtle' | 'off';

export interface ThemeSettings {
  presetId: BackgroundPresetId;
  name: string;
  bgBaseColor: string;
  glowColor1: string;
  glowColor2: string;
  patternStyle: PatternStyle;
  glowIntensity: GlowIntensity;
  isLight?: boolean;
  customHex?: string;
  updatedAt?: string;
}

export interface UpdateHistoryLog {
  id: string;
  timestamp: number; // Unix timestamp ms
  dateFormatted: string; // e.g., "27 Oct 2026"
  timeFormatted: string; // e.g., "10:25:40 AM"
  userId: string; // e.g., "SPAY447004"
  userName: string; // e.g., "Suman Dey"
  actionType: 'ADD_DIRECT' | 'MINUS_DIRECT' | 'UPGRADE' | 'NEW_USER' | 'EDIT' | 'RESET' | 'DELETE';
  actionLabel: string; // e.g., "Direct Added (+1)", "Direct Decreased (-1)", "New Contestant"
  changeSummary: string; // detailed changes, e.g., "Directs: 4 ➔ 5 | Tickets: 0 ➔ 1"
  previousDirects?: number;
  newDirects?: number;
  previousTickets?: number;
  newTickets?: number;
}
export interface RewardWinner {
  id: string; // unique id e.g. "win-1"
  userId: string; // e.g. "SPAY411819"
  name: string; // winner name e.g. "Leader One"
  prizeCategory: 'cash_top10' | 'lucky_draw' | 'mega_bonus' | 'special_gift';
  rankOrPosition: number | string; // e.g. 1 or "1st" or "Lucky Draw #5"
  prizeTitle: string; // e.g. "1st Prize: ₹51,000 Cash"
  prizeValue: string; // e.g. "₹51,000" or "Android Smartphone"
  announcedDate?: string; // e.g. "29 Oct 2026"
  claimStatus?: 'CLAIMED' | 'VERIFIED' | 'PENDING' | 'DISBURSED';
  badgeNote?: string; // e.g. "Grand Champion", "Mega Draw Winner"
}

export interface WinnersSettings {
  isVisible: boolean; // Admin show/hide toggle for public view
  title: string; // e.g. "🎉 SmartPay 360 Official Contest Winners Announced!"
  announcementSubtitle?: string; // Sub-headline
  lastUpdated: string;
  winners: RewardWinner[];
}
