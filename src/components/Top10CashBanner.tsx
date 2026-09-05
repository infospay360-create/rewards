import React from 'react';
import { Flame, Trophy, Coins, Sparkles, Award } from 'lucide-react';
import { LeaderboardUser } from '../types';
import { TOP_10_CASH_PRIZES } from '../utils/leaderboardUtils';

interface Top10CashBannerProps {
  users: LeaderboardUser[];
}

export const Top10CashBanner: React.FC<Top10CashBannerProps> = ({ users }) => {
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/50 p-5 sm:p-7 shadow-2xl mb-8 overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-amber-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-red-600 to-orange-600 text-white uppercase tracking-wider shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-current" /> CASH BONANZA
            </span>
            <span className="text-xs font-semibold text-amber-300">
              💎 PERFORM • RANK • WIN!
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex flex-wrap items-center gap-2">
            <span>🔥🏆 SMARTPAY360 | TOP 10 CASH 🏆🔥</span>
          </h2>
          <p className="text-xs sm:text-sm text-amber-200/90 font-medium mt-1">
            🚀 Secure your rank in the Top 10 to earn guaranteed CASH prizes! 💰 Leaders with the highest direct count & tickets take the lead!
          </p>
        </div>

        {/* Cash Rewards Prize Pool Badge */}
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

      {/* Grid of the 10 Cash Ranks */}
      <div className="relative z-10 mt-6">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>💰 Current Top 10 Live Cash Standing</span>
          <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Updated in real-time
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {Object.entries(TOP_10_CASH_PRIZES).map(([rankStr, prize]) => {
            const rank = parseInt(rankStr, 10);
            const userAtRank = users[rank - 1] || null;

            const isTop1 = rank === 1;
            const isTop2 = rank === 2;
            const isTop3 = rank === 3;
            const isTop4 = rank === 4;

            let cardBorder = 'border-slate-800/80 bg-slate-900/80';
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
                      <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
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
    </div>
  );
};
