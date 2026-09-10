import React from 'react';
import {
  Trophy,
  Coins,
  Crown,
  Sparkles,
  CheckCircle2,
  Wallet,
  ArrowUpRight,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { LeaderboardUser } from '../types';

interface Top10CashSectionProps {
  users: LeaderboardUser[];
  isLight?: boolean;
}

const CASH_PRIZES_LIST = [
  { rank: 1, label: '1st Place', amount: 4000, formatted: '₹4,000' },
  { rank: 2, label: '2nd Place', amount: 2000, formatted: '₹2,000' },
  { rank: 3, label: '3rd Place', amount: 1000, formatted: '₹1,000' },
  { rank: 4, label: '4th Place', amount: 750, formatted: '₹750' },
  { rank: 5, label: '5th Place', amount: 500, formatted: '₹500' },
  { rank: 6, label: '6th Place', amount: 500, formatted: '₹500' },
  { rank: 7, label: '7th Place', amount: 500, formatted: '₹500' },
  { rank: 8, label: '8th Place', amount: 500, formatted: '₹500' },
  { rank: 9, label: '9th Place', amount: 500, formatted: '₹500' },
  { rank: 10, label: '10th Place', amount: 500, formatted: '₹500' },
];

export const Top10CashSection: React.FC<Top10CashSectionProps> = ({
  users,
  isLight = true,
}) => {
  // Sort users strictly by highest tickets, then highest directs
  const sortedUsers = [...users].sort((a, b) => {
    if (b.ticketCount !== a.ticketCount) return b.ticketCount - a.ticketCount;
    return b.directCount - a.directCount;
  });

  const totalCashPool = CASH_PRIZES_LIST.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="mb-10 space-y-6">
      {/* 3D HD Header Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#0f172a] text-white p-6 sm:p-8 shadow-[0_20px_50px_rgba(4,120,87,0.3)] border-2 border-emerald-400/30">
        {/* Subtle 3D Ambient Lighting */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 p-0.5 shadow-[0_8px_25px_rgba(245,158,11,0.4)] shrink-0">
              <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center border border-amber-300/40">
                <Trophy className="w-9 h-9 sm:w-11 sm:h-11 text-amber-300 drop-shadow-md" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5 justify-center md:justify-start flex-wrap">
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/40 flex items-center gap-1.5 shadow-sm">
                  <Crown className="w-3.5 h-3.5 fill-amber-300" />
                  <span>Guaranteed Cash Pool</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-black uppercase border border-white/20">
                  Top 10 Leaders
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white mt-2 drop-shadow-md">
                💰 Top 10 Cash Rewards
              </h2>
              <p className="text-xs sm:text-sm font-bold text-emerald-100/90 mt-1 max-w-2xl">
                Guaranteed cash rewards for the Top 10 leaderboard champions, credited directly to SmartPay360 E-Wallets upon contest conclusion!
              </p>
            </div>
          </div>

          {/* Right: Cash Pool 3D Medallion */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-slate-950/70 backdrop-blur-md border border-amber-400/40 text-center shadow-[0_8px_25px_rgba(0,0,0,0.5)]">
              <span className="block text-[11px] font-black uppercase tracking-wider text-amber-300">
                Total Guaranteed Pool
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-center justify-center gap-1.5 mt-0.5">
                <Coins className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow" />
                <span>₹{totalCashPool.toLocaleString()}</span>
              </span>
              <span className="block text-[10px] font-black text-emerald-300 mt-1">
                10 Confirmed Winners
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Champions 3D HD Cards (1st, 2nd, 3rd) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1st Place - Gold Champion */}
        {(() => {
          const u = sortedUsers[0];
          return (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1c1917] to-[#0c0a09] border-2 border-amber-400/60 p-5 shadow-[0_12px_35px_rgba(245,158,11,0.25)] flex flex-col justify-between">
              <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs uppercase shadow-sm">
                🥇 1st Champion
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg border-2 border-amber-200">
                    1
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                      Cash Prize
                    </span>
                    <span className="text-2xl font-black text-white font-mono flex items-center gap-1">
                      <Coins className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <span>₹4,000</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3.5 rounded-2xl bg-white/[0.06] border border-amber-400/30">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Current Leader
                  </span>
                  <div className="text-base font-black text-white font-mono mt-0.5">
                    {u ? u.userId : 'Pending'}
                  </div>
                  <div className="text-xs font-bold text-amber-300 truncate">
                    {u ? u.name : 'Awaiting Leader'}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs font-mono font-bold text-slate-300 border-t border-white/10 pt-2">
                    <span>👥 {u ? u.directCount : 0} Directs</span>
                    <span className="text-amber-400">🎟️ {u ? u.ticketCount : 0} Tickets</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[11px] font-black text-center text-amber-200/90 bg-amber-500/10 py-1.5 rounded-xl border border-amber-500/20">
                ⭐ ₹4,000 Guaranteed Cash Reward
              </div>
            </div>
          );
        })()}

        {/* 2nd Place - Silver Runner Up */}
        {(() => {
          const u = sortedUsers[1];
          return (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0f172a] to-[#020617] border-2 border-sky-400/50 p-5 shadow-[0_12px_35px_rgba(2,132,199,0.2)] flex flex-col justify-between">
              <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black text-xs uppercase shadow-sm">
                🥈 2nd Place
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg border-2 border-white">
                    2
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-300 block">
                      Cash Prize
                    </span>
                    <span className="text-2xl font-black text-white font-mono flex items-center gap-1">
                      <Coins className="w-5 h-5 text-sky-400 fill-sky-400" />
                      <span>₹2,000</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3.5 rounded-2xl bg-white/[0.06] border border-sky-400/30">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Current Leader
                  </span>
                  <div className="text-base font-black text-white font-mono mt-0.5">
                    {u ? u.userId : 'Pending'}
                  </div>
                  <div className="text-xs font-bold text-sky-300 truncate">
                    {u ? u.name : 'Awaiting Leader'}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs font-mono font-bold text-slate-300 border-t border-white/10 pt-2">
                    <span>👥 {u ? u.directCount : 0} Directs</span>
                    <span className="text-sky-300">🎟️ {u ? u.ticketCount : 0} Tickets</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[11px] font-black text-center text-sky-200/90 bg-sky-500/10 py-1.5 rounded-xl border border-sky-500/20">
                ⭐ ₹2,000 Guaranteed Cash Reward
              </div>
            </div>
          );
        })()}

        {/* 3rd Place - Bronze Champion */}
        {(() => {
          const u = sortedUsers[2];
          return (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1c120c] to-[#0c0806] border-2 border-orange-400/50 p-5 shadow-[0_12px_35px_rgba(249,115,22,0.2)] flex flex-col justify-between">
              <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-gradient-to-r from-orange-400 to-amber-500 text-white font-black text-xs uppercase shadow-sm">
                🥉 3rd Place
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-orange-300">
                    3
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-300 block">
                      Cash Prize
                    </span>
                    <span className="text-2xl font-black text-white font-mono flex items-center gap-1">
                      <Coins className="w-5 h-5 text-orange-400 fill-orange-400" />
                      <span>₹1,000</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3.5 rounded-2xl bg-white/[0.06] border border-orange-400/30">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Current Leader
                  </span>
                  <div className="text-base font-black text-white font-mono mt-0.5">
                    {u ? u.userId : 'Pending'}
                  </div>
                  <div className="text-xs font-bold text-orange-300 truncate">
                    {u ? u.name : 'Awaiting Leader'}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs font-mono font-bold text-slate-300 border-t border-white/10 pt-2">
                    <span>👥 {u ? u.directCount : 0} Directs</span>
                    <span className="text-orange-300">🎟️ {u ? u.ticketCount : 0} Tickets</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[11px] font-black text-center text-orange-200/90 bg-orange-500/10 py-1.5 rounded-xl border border-orange-500/20">
                ⭐ ₹1,000 Guaranteed Cash Reward
              </div>
            </div>
          );
        })()}
      </div>

      {/* Ranks 4th to 10th Cash Cards Grid */}
      <div className="rounded-3xl bg-white dark:bg-[#0c1220]/90 border-2 border-slate-200 dark:border-white/[0.1] p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-white/10 flex-wrap">
          <div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-950 dark:text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              <span>Ranks 4th to 10th Guaranteed Cash Winners</span>
            </h3>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
              Position 4 wins ₹750 • Positions 5 to 10 win ₹500 each
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-300 dark:border-emerald-500/30">
            Direct Wallet Transfer
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CASH_PRIZES_LIST.slice(3).map((prize) => {
            const userIndex = prize.rank - 1;
            const currentHolder = sortedUsers[userIndex];
            const isRank4 = prize.rank === 4;

            return (
              <div
                key={prize.rank}
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-sm ${
                  isRank4
                    ? 'bg-gradient-to-br from-emerald-50 to-teal-50/60 dark:from-emerald-950/30 dark:to-teal-950/40 border-emerald-400 dark:border-emerald-500/40'
                    : 'bg-gradient-to-br from-amber-50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/30 border-amber-300 dark:border-amber-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-slate-950 text-white font-mono font-black text-xs flex items-center justify-center shadow-sm">
                      #{prize.rank}
                    </span>
                    <span className="text-xs font-black uppercase text-slate-950 dark:text-white">
                      {prize.label}
                    </span>
                  </div>
                  <span
                    className={`font-mono font-black text-sm px-2.5 py-0.5 rounded-full shadow-xs ${
                      isRank4
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {prize.formatted}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-white/10">
                  <div className="text-xs font-mono font-black text-slate-950 dark:text-white truncate">
                    {currentHolder ? currentHolder.userId : 'Pending'}
                  </div>
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                    {currentHolder ? currentHolder.name : 'Awaiting qualified leader'}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400">
                    <span>👥 {currentHolder ? currentHolder.directCount : 0} Directs</span>
                    <span>🎟️ {currentHolder ? currentHolder.ticketCount : 0} Tickets</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rule callout footer */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Rank criteria: 1st by highest tickets, 2nd by highest direct count.</span>
          </div>
          <span className="text-emerald-700 dark:text-emerald-400 font-black">
            Contest Period: 1 Sep to 31 Oct
          </span>
        </div>
      </div>
    </div>
  );
};
