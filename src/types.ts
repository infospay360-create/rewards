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

export type FilterCategory = 'all' | 'top10' | 'ticket_holders' | 'near_ticket';
export type SortOption = 'rank' | 'directs_desc' | 'tickets_desc' | 'recent';

export interface AdminCredentials {
  username: string;
  pin: string;
}

