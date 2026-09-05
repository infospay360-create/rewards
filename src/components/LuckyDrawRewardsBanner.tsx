import React, { useState, useMemo } from 'react';
import {
  Gift,
  Trophy,
  Sparkles,
  Ticket,
  Wallet,
  Shirt,
  Calendar,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LeaderboardUser } from '../types';
import {
  LUCKY_DRAW_PRIZES_LIST,
  WALLET_REWARD_TIERS,
  SPECIAL_TSHIRT_OFFER,
} from '../data/luckyDrawData';

interface LuckyDrawRewardsBannerProps {
  users: LeaderboardUser[];
}

interface FullPrizeItem {
  number: number;
  rankLabel: string;
  title: string;
  category: 'real_gift' | 'wallet_500' | 'wallet_250';
  categoryLabel: string;
  detail: string;
  badgeColor: string;
}

export const LuckyDrawRewardsBanner: React.FC<LuckyDrawRewardsBannerProps> = ({ users }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'real_gifts' | 'wallet_500' | 'wallet_250' | 'tshirt'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  // Compile full list of all 40 items
  const all40Prizes: FullPrizeItem[] = useMemo(() => {
    const list: FullPrizeItem[] = [];

    // 1 to 10 Real Gifts
    LUCKY_DRAW_PRIZES_LIST.forEach((p) => {
      list.push({
        number: p.rank,
        rankLabel: p.rankLabel,
        title: p.title,
        category: 'real_gift',
        categoryLabel: '🎁 Real Mega Gift',
        detail: p.detail,
        badgeColor: p.badgeColor,
      });
    });

    // 11 to 20 E-Wallet 500
    for (let i = 11; i <= 20; i++) {
      list.push({
        number: i,
        rankLabel: `${i}th`,
        title: 'E-WALLET ₹500',
        category: 'wallet_500',
        categoryLabel: '💵 E-Wallet Cash',
        detail: `Winner #${i} receives ₹500 SmartPay360 wallet cash credit`,
        badgeColor: 'from-indigo-500 to-purple-500 text-white',
      });
    }

    // 21 to 40 E-Wallet 250
    for (let i = 21; i <= 40; i++) {
      list.push({
        number: i,
        rankLabel: `${i}th`,
        title: 'E-WALLET ₹250',
        category: 'wallet_250',
        categoryLabel: '💵 E-Wallet Cash',
        detail: `Winner #${i} receives ₹250 SmartPay360 wallet cash credit`,
        badgeColor: 'from-slate-700 to-slate-800 text-amber-300',
      });
    }

    return list;
  }, []);

  const filteredPrizes = useMemo(() => {
    return all40Prizes.filter((prize) => {
      // Category filter
      if (activeCategory === 'real_gifts' && prize.category !== 'real_gift') return false;
      if (activeCategory === 'wallet_500' && prize.category !== 'wallet_500') return false;
      if (activeCategory === 'wallet_250' && prize.category !== 'wallet_250') return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = prize.title.toLowerCase().includes(q);
        const matchesDetail = prize.detail.toLowerCase().includes(q);
        const matchesRank = prize.number.toString() === q || prize.rankLabel.toLowerCase().includes(q);
        return matchesTitle || matchesDetail || matchesRank;
      }

      return true;
    });
  }, [all40Prizes, activeCategory, searchQuery]);

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 p-5 sm:p-7 shadow-2xl mb-8 overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute -top-20 -right-20 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 uppercase tracking-wider shadow-sm">
              <Gift className="w-3.5 h-3.5" /> 40 MEGA PRIZES
            </span>
            <span className="text-xs font-bold text-amber-300">
              🪔 Festive Season Special Lucky Draw
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <Calendar className="w-3 h-3 text-amber-400" /> 1 Sep — 31 Oct
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            🎁 SMARTPAY360 | 40 Lucky Draw Rewards List
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            🎟️ <strong>Rule:</strong> Every 5 Direct referrals generates 1 Lucky Draw Ticket! Members with higher ticket counts have greater chances to win these 40 Mega Prizes!
          </p>
        </div>

        {/* Quick Summary Pill & Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-right">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
              Total Lucky Rewards
            </span>
            <span className="text-base sm:text-lg font-black text-amber-300 font-mono">
              40 Prizes + Free T-Shirt
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
            title={isExpanded ? 'Collapse List' : 'View Full List'}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="relative z-10 mt-5 space-y-5">
          {/* Rules and T-Shirt Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Rule 1: Tickets */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black text-amber-300 block">
                  🎟️ 5 Directs = 1 Ticket
                </span>
                <span className="text-[11px] text-slate-300">
                  Every 5 direct referrals adds a new Lucky Draw ticket!
                </span>
              </div>
            </div>

            {/* Rule 2: 40 Winners */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-300 block">
                  🎁 10 Real Gifts + 30 E-Wallets
                </span>
                <span className="text-[11px] text-slate-300">
                  1st to 10th win mega home appliances; 11th to 40th receive wallet cash!
                </span>
              </div>
            </div>

            {/* Rule 3: Free T-Shirt */}
            <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Shirt className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black text-sky-300 block">
                  👕 Free T-Shirt on 1st 5 Directs!
                </span>
                <span className="text-[11px] text-slate-300">
                  Official SmartPay360 athletic branded dry-fit T-shirt!
                </span>
              </div>
            </div>
          </div>

          {/* Filter Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All 40 Rewards ({all40Prizes.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('real_gifts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeCategory === 'real_gifts'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🎁</span> Top 10 Real Gifts (10)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('wallet_500')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeCategory === 'wallet_500'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>💵</span> 11th–20th (₹500)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('wallet_250')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeCategory === 'wallet_250'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>💵</span> 21st–40th (₹250)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('tshirt')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeCategory === 'tshirt'
                    ? 'bg-sky-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>👕</span> Free T-Shirt Offer
              </button>
            </div>

            {/* Prize Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rewards (e.g. cycle, mixer)..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Conditional Special T-Shirt View */}
          {activeCategory === 'tshirt' ? (
            <div className="rounded-xl p-5 bg-slate-950 border border-sky-500/40 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-2xl">
                  👕
                </div>
                <div>
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                    SPECIAL GUARANTEED BONUS OFFER
                  </span>
                  <h3 className="text-lg font-black text-white">
                    {SPECIAL_TSHIRT_OFFER.title}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Requirement: Complete your first 5 direct referrals to receive an official SmartPay360 branded T-shirt!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {SPECIAL_TSHIRT_OFFER.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Clean Text List of 40 Prizes (No Images) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredPrizes.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                  No rewards match your search. Please try another search term.
                </div>
              ) : (
                filteredPrizes.map((prize) => {
                  const isTop3 = prize.number <= 3;
                  const isReal = prize.category === 'real_gift';

                  return (
                    <div
                      key={prize.number}
                      className={`relative rounded-xl p-3.5 border transition flex items-start justify-between gap-3 ${
                        isTop3
                          ? 'bg-amber-950/20 border-amber-500/50 hover:border-amber-400'
                          : isReal
                          ? 'bg-slate-950/70 border-slate-800 hover:border-amber-500/40'
                          : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Number Badge */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-mono font-black text-xs shadow-sm ${
                            prize.number === 1
                              ? 'bg-amber-500 text-slate-950'
                              : prize.number === 2
                              ? 'bg-slate-300 text-slate-950'
                              : prize.number === 3
                              ? 'bg-amber-700 text-white'
                              : isReal
                              ? 'bg-slate-800 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}
                        >
                          #{prize.number < 10 ? `0${prize.number}` : prize.number}
                        </div>

                        {/* Title & Description */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-black text-white tracking-tight">
                              {prize.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5" title={prize.detail}>
                            {prize.detail}
                          </p>
                        </div>
                      </div>

                      {/* Category Pill */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          isReal
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : prize.category === 'wallet_500'
                            ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {isReal ? 'Real Gift' : 'E-Wallet'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Footer formula note */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span>🎟️</span> <strong>Formula:</strong> 5 Directs = 1 Lucky Ticket (1 ticket awarded per 5 direct referrals)
            </span>
            <span className="text-amber-400 font-semibold">
              ✨ The more tickets you hold, the higher your chances of winning!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
