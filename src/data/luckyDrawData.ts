import { LuckyDrawPrize } from '../types';

export const LUCKY_DRAW_PRIZES_LIST: LuckyDrawPrize[] = [
  {
    rank: 1,
    rankLabel: '1st',
    title: 'WASHING MACHINE',
    category: 'real_gift',
    detail: 'Fully Automatic Real Home Appliance',
    iconType: 'washing-machine',
    badgeColor: 'from-amber-500 to-yellow-400 text-slate-950',
    isRealGift: true,
  },
  {
    rank: 2,
    rankLabel: '2nd',
    title: 'SPORTS BICYCLE',
    category: 'real_gift',
    detail: 'High Performance Geared Sports Cycle',
    iconType: 'bicycle',
    badgeColor: 'from-orange-500 to-amber-500 text-slate-950',
    isRealGift: true,
  },
  {
    rank: 3,
    rankLabel: '3rd',
    title: 'MIXER GRINDER',
    category: 'real_gift',
    detail: 'Multi-Jar Powerful Kitchen Mixer',
    iconType: 'mixer',
    badgeColor: 'from-blue-500 to-cyan-400 text-slate-950',
    isRealGift: true,
  },
  {
    rank: 4,
    rankLabel: '4th',
    title: '5Ltr PRESTIGE PRESSURE COOKER',
    category: 'real_gift',
    detail: 'Prestige Deluxe 5 Litre Cooker',
    iconType: 'cooker',
    badgeColor: 'from-emerald-500 to-teal-400 text-slate-950',
    isRealGift: true,
  },
  {
    rank: 5,
    rankLabel: '5th',
    title: 'GAS STOVE',
    category: 'real_gift',
    detail: 'Glass Top Dual Burner Gas Stove',
    iconType: 'gas-stove',
    badgeColor: 'from-purple-500 to-indigo-400 text-white',
    isRealGift: true,
  },
  {
    rank: 6,
    rankLabel: '6th',
    title: 'BLUETOOTH SOUND SYSTEM',
    category: 'real_gift',
    detail: 'Wireless Speaker System with Mic',
    iconType: 'speaker',
    badgeColor: 'from-pink-500 to-rose-400 text-white',
    isRealGift: true,
  },
  {
    rank: 7,
    rankLabel: '7th',
    title: 'COOKWARE SET',
    category: 'real_gift',
    detail: 'Non-Stick Multi-Piece Kitchen Cookware',
    iconType: 'cookware',
    badgeColor: 'from-sky-500 to-blue-400 text-white',
    isRealGift: true,
  },
  {
    rank: 8,
    rankLabel: '8th',
    title: 'NOKIA KEYPAD PHONE',
    category: 'real_gift',
    detail: 'Classic Durable Long Battery Mobile',
    iconType: 'phone',
    badgeColor: 'from-amber-600 to-orange-500 text-white',
    isRealGift: true,
  },
  {
    rank: 9,
    rankLabel: '9th',
    title: 'AMBRANE POWER BANK',
    category: 'real_gift',
    detail: 'Fast Charging High-Capacity Power Bank',
    iconType: 'powerbank',
    badgeColor: 'from-cyan-600 to-blue-500 text-white',
    isRealGift: true,
  },
  {
    rank: 10,
    rankLabel: '10th',
    title: 'FASTRACK SUNGLASSES',
    category: 'real_gift',
    detail: 'Original Fastrack Stylish UV Sunglasses',
    iconType: 'sunglasses',
    badgeColor: 'from-rose-600 to-pink-500 text-white',
    isRealGift: true,
  },
];

export const WALLET_REWARD_TIERS = {
  tier1: {
    rangeLabel: '11th to 20th',
    amount: 500,
    formatted: '₹500',
    winnersCount: 10,
    title: 'E-WALLET ₹500',
    type: 'SmartPay360 E-Wallet Cash',
    totalPool: 5000,
  },
  tier2: {
    rangeLabel: '21st to 40th',
    amount: 250,
    formatted: '₹250',
    winnersCount: 20,
    title: 'E-WALLET ₹250',
    type: 'SmartPay360 E-Wallet Cash',
    totalPool: 5000,
  },
};

export const SPECIAL_TSHIRT_OFFER = {
  requirement: '1st 5 Direct',
  title: 'FREE SMARTPAY360 T-SHIRT!',
  features: [
    'Premium Quality (Trusted & Reliable)',
    'Breathable Fabric (Stay Cool & Comfortable)',
    'Quick Dry Technology (Dry Fit Performance)',
    'Comfort Fit (Perfect for Everyday Wear)',
  ],
};

export function getLuckyDrawPrizeForRank(rank: number): {
  badge: string;
  title: string;
  type: 'real_gift' | 'wallet_cash' | 'participating';
  description: string;
  isRealGift: boolean;
} {
  if (rank >= 1 && rank <= 10) {
    const gift = LUCKY_DRAW_PRIZES_LIST[rank - 1];
    return {
      badge: `${gift.rankLabel} Mega Prize`,
      title: gift.title,
      type: 'real_gift',
      description: gift.detail,
      isRealGift: true,
    };
  }
  if (rank >= 11 && rank <= 20) {
    return {
      badge: '11th - 20th Prize',
      title: 'E-WALLET ₹500',
      type: 'wallet_cash',
      description: 'SmartPay360 E-Wallet Balance',
      isRealGift: false,
    };
  }
  if (rank >= 21 && rank <= 40) {
    return {
      badge: '21st - 40th Prize',
      title: 'E-WALLET ₹250',
      type: 'wallet_cash',
      description: 'SmartPay360 E-Wallet Balance',
      isRealGift: false,
    };
  }
  return {
    badge: 'Contestant',
    title: 'Lucky Draw Ticket Holder',
    type: 'participating',
    description: 'Earn 5 directs to unlock tickets & win 40 lucky draw prizes',
    isRealGift: false,
  };
}
