import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Coins,
  Gift,
  X,
  Sparkles,
  Flame,
  Search,
  CheckCircle2,
  Calendar,
  Wallet,
  Shirt,
  Ticket,
} from 'lucide-react';
import { LeaderboardUser } from '../types';
import { TOP_10_CASH_PRIZES } from '../utils/leaderboardUtils';
import {
  LUCKY_DRAW_PRIZES_LIST,
  SPECIAL_TSHIRT_OFFER,
} from '../data/luckyDrawData';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'cash' | 'gifts';
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

export const RewardsModal: React.FC<RewardsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'cash',
  users,
}) => {
  const [activeTab, setActiveTab] = useState<'cash' | 'gifts'>(initialTab);
  const [activeCategory, setActiveCategory] = useState<'all' | 'real_gifts' | 'wallet_500' | 'wallet_250' | 'tshirt'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync initialTab when modal opens
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Compile full list of all 40 items
  const all40Prizes: FullPrizeItem[] = React.useMemo(() => {
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
        categoryLabel: '🪙 E-Wallet Cash',
        detail: `Winner #${i} receives ₹250 SmartPay360 wallet cash credit`,
        badgeColor: 'from-emerald-600 to-teal-600 text-white',
      });
    }

    return list;
  }, []);

  // Filtered gifts list
  const filteredPrizes = React.useMemo(() => {
    return all40Prizes.filter((p) => {
      if (activeCategory === 'real_gifts' && p.category !== 'real_gift') return false;
      if (activeCategory === 'wallet_500' && p.category !== 'wallet_500') return false;
      if (activeCategory === 'wallet_250' && p.category !== 'wallet_250') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.detail.toLowerCase().includes(q) ||
          p.rankLabel.toLowerCase().includes(q) ||
          p.number.toString().includes(q)
        );
      }
      return true;
    });
  }, [all40Prizes, activeCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      id="rewards-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-950 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-red-600 text-white uppercase tracking-wider">
                  CONTEST PRIZES
                </span>
                <span className="text-[11px] text-amber-300 font-semibold hidden sm:inline">
                  SMARTPAY360 Official
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                <span>Contest Rewards & Prizes</span>
              </h2>
            </div>
          </div>

          <button
            id="close-rewards-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Selector Bar */}
        <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex flex-wrap gap-2 shrink-0">
          <button
            id="tab-top10-cash-btn"
            onClick={() => setActiveTab('cash')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'cash'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4 shrink-0" />
            <span>💰 Top 10 Cash Rewards</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'cash'
                  ? 'bg-slate-950/30 text-slate-950'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              Prize Pool
            </span>
          </button>

          <button
            id="tab-40-gifts-btn"
            onClick={() => setActiveTab('gifts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'gifts'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20 font-black'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4 shrink-0" />
            <span>🎁 40 Lucky Draw Gifts</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'gifts'
                  ? 'bg-white/20 text-white'
                  : 'bg-pink-500/20 text-pink-300'
              }`}
            >
              40 Items
            </span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: TOP 10 CASH REWARDS */}
          {activeTab === 'cash' && (
            <div className="space-y-6">
              {/* Cash Bonanza Banner Header */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/70 via-slate-900 to-slate-950 border border-amber-500/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-red-600 to-orange-600 text-white uppercase tracking-wider">
                      <Flame className="w-3.5 h-3.5 fill-current" /> CASH BONANZA
                    </span>
                    <span className="text-xs font-semibold text-amber-300">
                      PERFORM • RANK • WIN!
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    🔥 SMARTPAY360 Top 10 Cash Rewards
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-200/90 font-medium mt-1">
                    Secure your rank in the Top 10 to earn guaranteed CASH prizes. Leaders with the highest direct count & tickets take the lead!
                  </p>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 shrink-0 shadow-lg">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Coins className="w-7 h-7 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-300/80 block uppercase tracking-wider">
                      Top 10 Contest
                    </span>
                    <span className="text-lg sm:text-xl font-black text-amber-300 tracking-tight block">
                      Cash Rewards Prize Pool
                    </span>
                  </div>
                </div>
              </div>

              {/* Top 10 Live Cards Grid */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                  <span>💰 Current Top 10 Live Cash Standing</span>
                  <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Updated in real-time
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.entries(TOP_10_CASH_PRIZES).map(([rankStr, prize]) => {
                    const rank = parseInt(rankStr, 10);
                    const userAtRank = users[rank - 1] || null;

                    const isTop1 = rank === 1;
                    const isTop2 = rank === 2;
                    const isTop3 = rank === 3;
                    const isTop4 = rank === 4;

                    let cardBorder = 'border-slate-800 bg-slate-950/80';
                    let medalColor = 'text-indigo-300';
                    let cashColor = 'text-amber-400';

                    if (isTop1) {
                      cardBorder = 'border-amber-400/60 bg-gradient-to-b from-amber-950/60 to-slate-900/90 shadow-lg shadow-amber-500/15';
                      medalColor = 'text-amber-400';
                      cashColor = 'text-amber-300 font-black';
                    } else if (isTop2) {
                      cardBorder = 'border-slate-300/50 bg-gradient-to-b from-slate-800/80 to-slate-900/90';
                      medalColor = 'text-slate-200';
                      cashColor = 'text-amber-400 font-black';
                    } else if (isTop3) {
                      cardBorder = 'border-amber-700/50 bg-gradient-to-b from-amber-950/40 to-slate-900/90';
                      medalColor = 'text-amber-500';
                      cashColor = 'text-amber-400 font-bold';
                    } else if (isTop4) {
                      cardBorder = 'border-emerald-500/40 bg-slate-900/80';
                      medalColor = 'text-emerald-400';
                    }

                    return (
                      <div
                        key={rank}
                        className={`relative rounded-xl p-3 border transition-all hover:scale-[1.02] flex flex-col justify-between ${cardBorder}`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-xs font-black ${medalColor}`}>
                              {prize.badge}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-500">
                              #{rank < 10 ? `0${rank}` : rank}
                            </span>
                          </div>

                          <div className={`text-base sm:text-lg font-black font-mono tracking-tight ${cashColor}`}>
                            💵 {prize.formatted}
                          </div>
                        </div>

                        {/* Current Leader at this rank */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px]">
                          {userAtRank ? (
                            <div>
                              <div className="font-mono font-bold text-white truncate">
                                {userAtRank.userId}
                              </div>
                              <div className="text-[10px] text-slate-300 truncate">
                                {userAtRank.name}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                                <span className="text-emerald-400 font-semibold">
                                  👥 {userAtRank.directCount} Direct
                                </span>
                                <span className="text-amber-300 font-semibold">
                                  🎟️ {userAtRank.ticketCount}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Open position</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Direct to Ticket Rule box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Ticket className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    <strong className="text-emerald-400">Rule:</strong> Every 5 Directs = 1 Lucky Draw Ticket. More Directs = Higher Rank & More Tickets!
                  </span>
                </div>
                <div className="text-amber-400 font-bold">
                  Contest Ends: 31 October 2026
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 40 LUCKY DRAW GIFTS */}
          {activeTab === 'gifts' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-purple-600 to-pink-600 text-white uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 fill-current" /> DURGA PUJA & DIWALI SPECIAL
                    </span>
                    <span className="text-xs font-semibold text-pink-300">
                      40 Lucky Winners
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    🎁 40 Lucky Draw Rewards List
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-200/90 font-medium mt-1">
                    Complete prize catalog: 10 Mega Gifts + 10 E-Wallet ₹500 + 20 E-Wallet ₹250. Every ticket gives you a chance to win!
                  </p>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 shrink-0">
                  <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300">
                    <Gift className="w-7 h-7 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-indigo-300/80 block uppercase tracking-wider">
                      Lucky Draw Total
                    </span>
                    <span className="text-lg sm:text-xl font-black text-white tracking-tight block">
                      40 Lucky Rewards
                    </span>
                  </div>
                </div>
              </div>

              {/* Special T-Shirt Offer Banner */}
              <div className="rounded-xl p-4 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-red-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                    <Shirt className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-amber-400 tracking-wider">
                      {SPECIAL_TSHIRT_OFFER.title}
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      Requirement: {SPECIAL_TSHIRT_OFFER.requirement}
                    </div>
                    <div className="text-xs text-amber-200/80">
                      {SPECIAL_TSHIRT_OFFER.features.join(' • ')}
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shrink-0">
                  FREE T-SHIRT
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      activeCategory === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    All 40 Items ({all40Prizes.length})
                  </button>
                  <button
                    onClick={() => setActiveCategory('real_gifts')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      activeCategory === 'real_gifts'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    1-10 Mega Gifts
                  </button>
                  <button
                    onClick={() => setActiveCategory('wallet_500')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      activeCategory === 'wallet_500'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    11-20 (₹500 Wallet)
                  </button>
                  <button
                    onClick={() => setActiveCategory('wallet_250')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      activeCategory === 'wallet_250'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    21-40 (₹250 Wallet)
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search prize name or rank..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-60 pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 40 Prizes List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {filteredPrizes.map((prize) => {
                  const isReal = prize.category === 'real_gift';
                  const is500 = prize.category === 'wallet_500';

                  let itemCardClass = 'bg-slate-950/80 border-slate-800';
                  let itemNumberBg = 'bg-slate-800 text-slate-300';

                  if (isReal) {
                    itemCardClass = 'bg-gradient-to-b from-purple-950/40 to-slate-950 border-purple-500/30 hover:border-purple-500/60';
                    itemNumberBg = 'bg-purple-600 text-white font-black';
                  } else if (is500) {
                    itemCardClass = 'bg-gradient-to-b from-indigo-950/40 to-slate-950 border-indigo-500/30 hover:border-indigo-500/60';
                    itemNumberBg = 'bg-indigo-600 text-white font-black';
                  } else {
                    itemCardClass = 'bg-gradient-to-b from-emerald-950/30 to-slate-950 border-emerald-500/20 hover:border-emerald-500/50';
                    itemNumberBg = 'bg-emerald-600 text-white font-bold';
                  }

                  return (
                    <div
                      key={prize.number}
                      className={`p-3.5 rounded-xl border transition-all hover:scale-[1.01] flex flex-col justify-between ${itemCardClass}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${itemNumberBg}`}>
                            PRIZE #{prize.number}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {prize.categoryLabel}
                          </span>
                        </div>

                        <div className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                          {prize.title}
                        </div>

                        <div className="text-xs text-slate-400 mt-1 leading-snug">
                          {prize.detail}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Status: Eligible</span>
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ticket Draw
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Close */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            SmartPay360 Contest • 5 Direct = 1 Ticket
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
