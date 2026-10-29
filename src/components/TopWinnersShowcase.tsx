import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Sparkles,
  Award,
  Gift,
  CheckCircle2,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  Share2,
  ExternalLink,
  ShieldCheck,
  PartyPopper,
  Flame,
  Crown,
} from 'lucide-react';
import { RewardWinner, WinnersSettings } from '../types';

interface TopWinnersShowcaseProps {
  settings: WinnersSettings;
  isAdmin?: boolean;
  onNavigateToAdminWinners?: () => void;
  isLight?: boolean;
  showToast?: (msg: string) => void;
}

export const TopWinnersShowcase: React.FC<TopWinnersShowcaseProps> = ({
  settings,
  isAdmin = false,
  onNavigateToAdminWinners,
  isLight = false,
  showToast,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'cash_top10' | 'lucky_draw'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.3 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#ffd700'],
      });
    } catch {
      // fallback
    }
  };

  const filteredWinners = useMemo(() => {
    return settings.winners.filter((w) => {
      const matchCat = filterCategory === 'all' || w.prizeCategory === filterCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.userId.toLowerCase().includes(q) ||
        w.prizeTitle.toLowerCase().includes(q) ||
        w.prizeValue.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [settings.winners, filterCategory, searchQuery]);

  // Statistics
  const totalCashDistributed = useMemo(() => {
    return settings.winners
      .filter((w) => w.prizeCategory === 'cash_top10')
      .reduce((sum, w) => {
        const num = parseInt(w.prizeValue.replace(/[^0-9]/g, ''), 10) || 0;
        return sum + num;
      }, 0);
  }, [settings.winners]);

  const copyUserId = (userId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(userId);
      if (showToast) showToast(`📋 User ID ${userId} copied!`);
    }
  };

  if (!settings.isVisible) {
    return null;
  }

  return (
    <div className="relative z-20 mb-8 w-full max-w-7xl mx-auto px-3 sm:px-6">
      <div
        className={`relative overflow-hidden rounded-3xl border transition-all duration-300 shadow-2xl ${
          isLight
            ? 'bg-gradient-to-b from-amber-50 via-white to-amber-50/40 border-amber-300/80 shadow-amber-500/10'
            : 'bg-gradient-to-b from-[#181507] via-[#10131d] to-[#0c0f18] border-amber-500/40 shadow-amber-500/15'
        }`}
      >
        {/* Top Glowing Ambient Accents */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-36 bg-amber-500/15 blur-3xl pointer-events-none rounded-full" />

        {/* Header Section */}
        <div className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                  <Trophy className="w-6 h-6 sm:w-7 sm:h-7 animate-bounce text-amber-950" />
                </div>
                <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-[10px] font-black uppercase text-white px-1.5 py-0.5 rounded-full shadow flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  LIVE
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    🏆 OFFICIAL WINNERS
                  </span>
                  <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    SmartPay 360 Rewards
                  </span>
                </div>
                <h2
                  className={`text-lg sm:text-2xl font-black tracking-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {settings.title || 'Official Contest Rewards & Winners'}
                </h2>
                <p className={`text-xs sm:text-sm mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  {settings.announcementSubtitle ||
                    'Congratulating all the prize winners of the SmartPay 360 Direct Referral & Lucky Draw Contest!'}
                </p>
              </div>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-2 sm:self-center self-end">
              <button
                type="button"
                onClick={triggerConfetti}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 active:scale-95 transition-transform"
                title="Celebrate with Confetti"
              >
                <PartyPopper className="w-4 h-4" />
                <span>Celebrate 🎊</span>
              </button>

              {isAdmin && onNavigateToAdminWinners && (
                <button
                  type="button"
                  onClick={onNavigateToAdminWinners}
                  className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-500/40 shadow-sm flex items-center gap-1.5 transition-all"
                  title="Admin Settings for Winners"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Admin Edit</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-2 rounded-xl border transition-colors ${
                  isLight
                    ? 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                    : 'border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                }`}
                title={isExpanded ? 'Collapse winners list' : 'Expand winners list'}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-amber-500/20">
            <div
              className={`p-2.5 rounded-xl border ${
                isLight ? 'bg-amber-100/60 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Total Winners</div>
              <div className={`text-base sm:text-lg font-black ${isLight ? 'text-amber-950' : 'text-amber-300'}`}>
                {settings.winners.length} Leaders
              </div>
            </div>

            <div
              className={`p-2.5 rounded-xl border ${
                isLight ? 'bg-emerald-100/60 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/20'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Top 10 Cash Pool</div>
              <div className={`text-base sm:text-lg font-black ${isLight ? 'text-emerald-950' : 'text-emerald-400'}`}>
                ₹{totalCashDistributed > 0 ? totalCashDistributed.toLocaleString('en-IN') : '1,30,000+'}
              </div>
            </div>

            <div
              className={`p-2.5 rounded-xl border ${
                isLight ? 'bg-purple-100/60 border-purple-200' : 'bg-purple-500/10 border-purple-500/20'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Lucky Draw Gifts</div>
              <div className={`text-base sm:text-lg font-black ${isLight ? 'text-purple-950' : 'text-purple-300'}`}>
                {settings.winners.filter((w) => w.prizeCategory === 'lucky_draw').length || 40} Prizes
              </div>
            </div>

            <div
              className={`p-2.5 rounded-xl border ${
                isLight ? 'bg-blue-100/60 border-blue-200' : 'bg-blue-500/10 border-blue-500/20'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Live Status</div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Verified & Published
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Winners Body */}
        {isExpanded && (
          <div className="p-4 sm:p-6 pt-0">
            {/* Filter Chips & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 pt-3 border-t border-slate-700/40">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setFilterCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    filterCategory === 'all'
                      ? 'bg-amber-500 text-amber-950 shadow-sm'
                      : isLight
                      ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  All Winners ({settings.winners.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('cash_top10')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    filterCategory === 'cash_top10'
                      ? 'bg-amber-500 text-amber-950 shadow-sm'
                      : isLight
                      ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  💰 Top 10 Cash ({settings.winners.filter((w) => w.prizeCategory === 'cash_top10').length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('lucky_draw')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    filterCategory === 'lucky_draw'
                      ? 'bg-amber-500 text-amber-950 shadow-sm'
                      : isLight
                      ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  🎁 Lucky Draw ({settings.winners.filter((w) => w.prizeCategory === 'lucky_draw').length})
                </button>
              </div>

              {/* Search winner */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search winner name or ID..."
                  className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                      : 'bg-slate-900/90 border-slate-700 text-white focus:border-amber-500'
                  }`}
                />
              </div>
            </div>

            {/* Winners Grid */}
            {filteredWinners.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No winners matched your current filter or search criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredWinners.map((winner, idx) => {
                  const isTopRank = winner.rankOrPosition === 1 || winner.rankOrPosition === '1';
                  const isTop3 =
                    winner.rankOrPosition === 1 ||
                    winner.rankOrPosition === 2 ||
                    winner.rankOrPosition === 3 ||
                    winner.rankOrPosition === '1' ||
                    winner.rankOrPosition === '2' ||
                    winner.rankOrPosition === '3';

                  return (
                    <div
                      key={winner.id || `win-${idx}`}
                      className={`relative rounded-2xl p-3.5 border transition-all duration-200 flex flex-col justify-between ${
                        isTopRank
                          ? isLight
                            ? 'bg-amber-100/70 border-amber-400 shadow-md shadow-amber-300/30 ring-1 ring-amber-400/50'
                            : 'bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-slate-900/80 border-amber-500/60 shadow-lg shadow-amber-500/10'
                          : isLight
                          ? 'bg-white/90 border-slate-200/90 shadow-sm hover:border-amber-300'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Top Row: Rank Badge & Category */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          {isTopRank ? (
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-950 flex items-center justify-center font-black text-sm shadow">
                              <Crown className="w-4 h-4 text-amber-950" />
                            </div>
                          ) : (
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                                isTop3
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              #{winner.rankOrPosition}
                            </div>
                          )}

                          <div>
                            <div
                              className={`text-sm font-black tracking-tight leading-tight ${
                                isLight ? 'text-slate-900' : 'text-white'
                              }`}
                            >
                              {winner.name}
                            </div>
                            <button
                              type="button"
                              onClick={() => copyUserId(winner.userId)}
                              className="text-[11px] font-mono font-semibold text-amber-400 hover:underline flex items-center gap-1"
                              title="Click to copy User ID"
                            >
                              {winner.userId}
                              <span className="text-[9px] text-slate-400 font-sans">(copy)</span>
                            </button>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              winner.claimStatus === 'DISBURSED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : winner.claimStatus === 'VERIFIED'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {winner.claimStatus || 'VERIFIED'}
                          </span>
                          {winner.announcedDate && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              {winner.announcedDate}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Prize Details Card */}
                      <div
                        className={`mt-2 p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                          winner.prizeCategory === 'cash_top10'
                            ? isLight
                              ? 'bg-amber-50 border-amber-200'
                              : 'bg-amber-500/10 border-amber-500/20'
                            : isLight
                            ? 'bg-purple-50 border-purple-200'
                            : 'bg-purple-500/10 border-purple-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {winner.prizeCategory === 'cash_top10' ? (
                            <Award className="w-5 h-5 text-amber-400 shrink-0" />
                          ) : (
                            <Gift className="w-5 h-5 text-purple-400 shrink-0" />
                          )}
                          <div>
                            <div
                              className={`text-xs font-black ${
                                isLight ? 'text-slate-900' : 'text-slate-100'
                              }`}
                            >
                              {winner.prizeTitle}
                            </div>
                            {winner.badgeNote && (
                              <div className="text-[10px] font-bold text-amber-400">
                                {winner.badgeNote}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`text-xs sm:text-sm font-black ${
                              winner.prizeCategory === 'cash_top10'
                                ? 'text-emerald-400'
                                : 'text-purple-400'
                            }`}
                          >
                            {winner.prizeValue}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
