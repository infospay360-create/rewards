import React, { useState } from 'react';
import {
  Gift,
  Ticket,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Trophy,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { LeaderboardUser } from '../types';
import { LUCKY_DRAW_PRIZES_LIST } from '../data/luckyDrawData';

interface LuckyDrawWinnersBlockProps {
  users: LeaderboardUser[];
  onOpenGiftsModal: () => void;
  isLight?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const LuckyDrawWinnersBlock: React.FC<LuckyDrawWinnersBlockProps> = ({
  users,
  onOpenGiftsModal,
  isLight = true,
  isOpen: controlledIsOpen,
  onToggle,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const toggleFold = onToggle || (() => setInternalIsOpen((prev) => !prev));

  const [activeTab, setActiveTab] = useState<'prizes' | 'qualified'>('prizes');

  // Top 10 Real Gift Prizes
  const top10Prizes = LUCKY_DRAW_PRIZES_LIST.slice(0, 10);

  // Users who have at least 1 ticket
  const ticketHolders = users.filter((u) => u.ticketCount > 0);
  const totalTickets = users.reduce((sum, u) => sum + u.ticketCount, 0);

  return (
    <div className="mb-6">
      {/* Folding Header Bar (Always visible at the top) */}
      <div className="rounded-2xl bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#c2410c] text-white shadow-xl shadow-orange-600/25 border-2 border-orange-300/40 p-3 sm:p-4 transition-all duration-300">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left Title & Status */}
          <button
            type="button"
            onClick={toggleFold}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black/25 flex items-center justify-center text-yellow-300 border border-white/20 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 fill-yellow-400/40" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                  <span>🎁 Lucky Draw 10 Winners (Mega Real Gifts)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-black/30 text-yellow-300 text-[10px] font-black uppercase border border-yellow-400/40">
                  40 Prizes
                </span>
              </div>
              <p className="text-xs font-bold text-orange-100 flex items-center gap-1.5 mt-0.5">
                <span className="text-yellow-200 font-extrabold">👥 5 Direct = 🎟️ 1 Ticket</span>
                <span>•</span>
                <span>{totalTickets} Live Tickets Earned</span>
              </p>
            </div>
          </button>

          {/* Right: Folding Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenGiftsModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/30 hover:bg-black/40 text-yellow-200 text-xs font-black border border-white/20 transition cursor-pointer"
            >
              <span>Full List</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={toggleFold}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-yellow-300 font-black text-xs transition-all duration-200 shadow-md border border-yellow-400/40 cursor-pointer active:scale-95"
            >
              <span>{isOpen ? 'Fold' : 'Unfold 10 Gifts'}</span>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Unfolded Content (Visible when isOpen is true) */}
        {isOpen && (
          <div className="pt-4 mt-3 border-t border-orange-300/30">
            {/* Tab Selector: Top 10 Real Gift Prizes vs Qualified Ticket Holders */}
            <div className="flex items-center justify-between gap-3 pb-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('prizes')}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTab === 'prizes'
                      ? 'bg-white text-[#c2410c] shadow-md'
                      : 'bg-black/20 text-white/90 hover:bg-black/30'
                  }`}
                >
                  🎁 Top 10 Mega Gifts
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('qualified')}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'qualified'
                      ? 'bg-white text-[#c2410c] shadow-md'
                      : 'bg-black/20 text-white/90 hover:bg-black/30'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Qualified Members ({ticketHolders.length})</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onOpenGiftsModal}
                className="text-xs font-black text-yellow-200 hover:text-white underline cursor-pointer"
              >
                Open Full 40 Prizes Modal →
              </button>
            </div>

            {/* Tab 1: Top 10 Mega Real Gifts Cards */}
            {activeTab === 'prizes' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
                {top10Prizes.map((prize) => (
                  <div
                    key={prize.rank}
                    onClick={onOpenGiftsModal}
                    className="group relative rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 hover:border-yellow-300 p-2.5 text-center transition-all duration-200 backdrop-blur-md cursor-pointer shadow-md flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-black/40 text-yellow-300 text-[10px] font-black border border-yellow-400/30">
                        {prize.rank === 1 ? '🥇 1st' : prize.rank === 2 ? '🥈 2nd' : prize.rank === 3 ? '🥉 3rd' : `#${prize.rank}`}
                      </span>
                      <span className="text-[9px] font-black uppercase text-orange-100">
                        Real Gift
                      </span>
                    </div>

                    <div className="py-2">
                      <h4 className="text-xs font-black text-white line-clamp-2 leading-tight uppercase group-hover:text-yellow-200">
                        {prize.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Qualified Ticket Holders */}
            {activeTab === 'qualified' && (
              <div className="pt-1">
                {ticketHolders.length === 0 ? (
                  <div className="p-4 rounded-xl bg-black/20 text-center">
                    <p className="text-xs font-bold text-white">No members have reached 5 direct referrals yet.</p>
                    <p className="text-[10px] text-orange-200 mt-0.5">Complete 5 direct referrals to earn your 1st ticket!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {ticketHolders.map((user, idx) => (
                      <div
                        key={user.id}
                        className="p-2.5 rounded-xl bg-black/25 border border-white/20 backdrop-blur-md flex items-center justify-between gap-2 shadow-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-yellow-400 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </div>
                          <div className="min-w-0">
                            <span className="block text-xs font-black text-white truncate font-mono">
                              {user.userId}
                            </span>
                            <span className="block text-[10px] font-black text-orange-200 truncate">
                              {user.name}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-400 text-slate-950 text-[10px] font-black">
                            <Ticket className="w-2.5 h-2.5" />
                            <span>{user.ticketCount} {user.ticketCount === 1 ? 'Ticket' : 'Tickets'}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Close / Fold Bar */}
            <div className="mt-3 pt-2 border-t border-white/15 flex items-center justify-between text-xs font-bold text-orange-100">
              <span>Plus 30 E-Wallet Cash Winners (₹500 & ₹250 directly to Wallet)</span>
              <button
                type="button"
                onClick={toggleFold}
                className="text-white hover:text-yellow-200 underline text-xs font-black cursor-pointer flex items-center gap-1"
              >
                <span>Fold ▲</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
