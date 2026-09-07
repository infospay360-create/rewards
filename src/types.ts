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
  customHex?: string;
  updatedAt?: string;
}

