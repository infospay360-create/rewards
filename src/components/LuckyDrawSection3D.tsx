import React, { useState } from 'react';
import {
  Gift,
  Ticket,
  Shirt,
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  Wallet,
  Tv,
  Smartphone,
  Watch,
  Flame,
  Speaker,
  Zap,
  Award,
} from 'lucide-react';
import { LeaderboardUser } from '../types';
import { LUCKY_DRAW_PRIZES_LIST } from '../data/luckyDrawData';

interface LuckyDrawSection3DProps {
  users: LeaderboardUser[];
  isLight?: boolean;
}

export const LuckyDrawSection3D: React.FC<LuckyDrawSection3DProps> = ({
  users,
  isLight = true,
}) => {
  const [activeTab, setActiveTab] = useState<'real_gifts' | 'wallet_cash' | 'qualified_members'>('real_gifts');
  const [searchQuery, setSearchQuery] = useState('');

  // Qualified members who actually hold tickets (directCount >= 5)
  const qualifiedMembers = users.filter((u) => u.ticketCount > 0 || u.directCount >= 5);
  const totalTicketsDistributed = users.reduce((sum, u) => sum + u.ticketCount, 0);

  // Helper icons for real gifts
  const getGiftIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🧺'; // Washing machine
      case 2:
        return '🚴'; // Sports bicycle
      case 3:
        return '⚡'; // Mixer grinder
      case 4:
        return '🍲'; // Pressure cooker
      case 5:
        return '🔥'; // Gas stove
      case 6:
        return '🔊'; // Bluetooth speaker
      case 7:
        return '🍳'; // Cookware set
      case 8:
        return '📱'; // Nokia phone
      case 9:
        return '🔋'; // Power bank
      case 10:
        return '⌚'; // Titan watch
      default:
        return '🎁';
    }
  };

  return (
    <div className="mb-10 space-y-6">
      {/* 3D HD Header Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#c2410c] via-[#ea580c] to-[#7c2d12] text-white p-6 sm:p-8 shadow-[0_20px_50px_rgba(234,88,12,0.3)] border-2 border-orange-400/40">
        {/* Subtle 3D Ambient Lighting */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-yellow-300/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 p-0.5 shadow-[0_8px_25px_rgba(234,88,12,0.4)] shrink-0">
              <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center border border-yellow-300/40">
                <Gift className="w-9 h-9 sm:w-11 sm:h-11 text-yellow-300 drop-shadow-md" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5 justify-center md:justify-start flex-wrap">
                <span className="px-3 py-1 rounded-full bg-yellow-400/25 text-yellow-200 text-xs font-black uppercase tracking-wider border border-yellow-300/40 flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 fill-yellow-300" />
                  <span>Mega Lucky Draw Event</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-black uppercase border border-white/20">
                  40 Total Winners
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white mt-2 drop-shadow-md">
                🎁 40 Lucky Draw Prizes
              </h2>
              <p className="text-xs sm:text-sm font-bold text-orange-100/95 mt-1 max-w-2xl">
                10 Real Mega Appliances + 30 E-Wallet Cash Prizes! Every 5 directs awards 1 Lucky Draw Ticket. Earn a free SmartPay360 T-shirt on your 1st 5 directs!
              </p>
            </div>
          </div>

          {/* Right: Ticket Stats 3D Card */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-slate-950/70 backdrop-blur-md border border-orange-400/40 text-center shadow-[0_8px_25px_rgba(0,0,0,0.5)]">
              <span className="block text-[11px] font-black uppercase tracking-wider text-yellow-300">
                Total Tickets In Pool
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-center justify-center gap-1.5 mt-0.5">
                <Ticket className="w-6 h-6 text-amber-400" />
                <span>{totalTicketsDistributed} Tickets</span>
              </span>
              <span className="block text-[10px] font-black text-orange-200 mt-1">
                {qualifiedMembers.length} Qualified Members
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Special Offer Highlight Banner: 1st 5 Directs = Free T-Shirt */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#075985] text-white p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 border border-sky-300/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
            <Shirt className="w-5 h-5 text-sky-100" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md text-sky-100">
              Special Guaranteed Reward
            </span>
            <h4 className="text-sm sm:text-base font-black text-white mt-0.5">
              👕 Reach 5 Directs ➜ Win Free SmartPay360 T-Shirt + 1 Lucky Draw Ticket!
            </h4>
          </div>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-black/25 text-xs font-black text-white whitespace-nowrap border border-white/20">
          5 Directs Needed
        </div>
      </div>

      {/* Filter / Category Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#0c1220] border border-slate-200 dark:border-white/10">
          <button
            onClick={() => setActiveTab('real_gifts')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'real_gifts'
                ? 'bg-[#ea580c] text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            🎁 10 Real Mega Gifts
          </button>
          <button
            onClick={() => setActiveTab('wallet_cash')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'wallet_cash'
                ? 'bg-[#ea580c] text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            💵 30 E-Wallet Prizes
          </button>
          <button
            onClick={() => setActiveTab('qualified_members')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'qualified_members'
                ? 'bg-[#ea580c] text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            🎟️ Qualified Members ({qualifiedMembers.length})
          </button>
        </div>

        {activeTab === 'qualified_members' && (
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search user ID or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs font-mono font-bold bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-white/10 text-slate-950 dark:text-white focus:outline-none focus:border-orange-500"
            />
          </div>
        )}
      </div>

      {/* Tab 1: 10 Real Mega Appliance Gifts */}
      {activeTab === 'real_gifts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {LUCKY_DRAW_PRIZES_LIST.map((gift) => {
            return (
              <div
                key={gift.rank}
                className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0c1220]/90 border-2 border-slate-200 dark:border-white/[0.1] p-4 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
              >
                {/* 3D Top Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black text-xs font-mono flex items-center justify-center shadow-md">
                    #{gift.rank}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-500/30">
                    Real Gift
                  </span>
                </div>

                {/* Gift Visual Icon & Details */}
                <div className="text-center py-2">
                  <div className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                    {getGiftIcon(gift.rank)}
                  </div>
                  <h4 className="text-sm font-black uppercase text-slate-950 dark:text-white mt-2 tracking-tight">
                    {gift.title}
                  </h4>
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                    {gift.detail}
                  </p>
                </div>

                {/* Bottom eligibility pill */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-white/10 text-center">
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">
                    🎟️ Lucky Draw Ticket Holders
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: 30 E-Wallet Cash Prizes */}
      {activeTab === 'wallet_cash' && (
        <div className="space-y-4">
          {/* 11th to 20th (10 Winners x ₹500) */}
          <div className="rounded-2xl bg-white dark:bg-[#0c1220]/90 border-2 border-slate-200 dark:border-white/[0.1] p-5 shadow-md">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                  <Wallet className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-950 dark:text-white">
                    Prizes 11th to 20th • E-Wallet ₹500 (10 Winners)
                  </h4>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    ₹500 direct wallet credit per winner (Total ₹5,000 pool)
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-mono font-black text-xs">
                ₹500 Each
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {Array.from({ length: 10 }).map((_, idx) => {
                const prizeNo = 11 + idx;
                return (
                  <div
                    key={prizeNo}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center"
                  >
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 block">
                      Draw #{prizeNo}
                    </span>
                    <span className="text-sm font-black font-mono text-indigo-600 dark:text-indigo-400">
                      ₹500 Cash
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 21st to 40th (20 Winners x ₹250) */}
          <div className="rounded-2xl bg-white dark:bg-[#0c1220]/90 border-2 border-slate-200 dark:border-white/[0.1] p-5 shadow-md">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Wallet className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-950 dark:text-white">
                    Prizes 21st to 40th • E-Wallet ₹250 (20 Winners)
                  </h4>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    ₹250 direct wallet credit per winner (Total ₹5,000 pool)
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-black text-xs">
                ₹250 Each
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
              {Array.from({ length: 20 }).map((_, idx) => {
                const prizeNo = 21 + idx;
                return (
                  <div
                    key={prizeNo}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center"
                  >
                    <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 block">
                      #{prizeNo}
                    </span>
                    <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                      ₹250
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Qualified Ticket Holders */}
      {activeTab === 'qualified_members' && (
        <div className="rounded-2xl bg-white dark:bg-[#0c1220]/90 border-2 border-slate-200 dark:border-white/[0.1] p-5 shadow-md">
          <div className="mb-4">
            <h4 className="text-sm sm:text-base font-black text-slate-950 dark:text-white">
              Members Qualified for Lucky Draw Tickets (5+ Directs)
            </h4>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Each 5 directs = 1 Ticket in the official Lucky Draw drum!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {qualifiedMembers
              .filter(
                (u) =>
                  !searchQuery ||
                  u.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((u, idx) => {
                return (
                  <div
                    key={u.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-orange-500 text-white font-mono font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-mono font-black text-xs text-slate-950 dark:text-white block">
                          {u.userId}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block truncate max-w-[140px]">
                          {u.name}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-mono font-black text-xs border border-rose-300 dark:border-rose-500/30">
                        🎟️ {u.ticketCount} {u.ticketCount === 1 ? 'Ticket' : 'Tickets'}
                      </span>
                      <span className="block text-[10px] font-bold text-slate-500 mt-0.5">
                        👥 {u.directCount} Directs
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
