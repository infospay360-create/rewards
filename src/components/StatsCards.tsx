import React from 'react';
import { Users, Ticket, Trophy, Sparkles } from 'lucide-react';
import { LeaderboardUser } from '../types';

interface StatsCardsProps {
  users: LeaderboardUser[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ users }) => {
  const totalUsers = users.length;
  const totalTickets = users.reduce((sum, u) => sum + (u.ticketCount || 0), 0);
  
  // Top user
  const topUser = users.length > 0 ? users[0] : null;
  const nearTicketCount = users.filter((u) => u.directCount % 5 === 4).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 my-6">
      {/* Total Users */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0c1220]/80 backdrop-blur-xl border border-white/[0.08] p-4 sm:p-5 shadow-[0_12px_36px_rgba(0,0,0,0.35)] group hover:border-white/[0.15] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-300">Total Contestants</span>
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
            {totalUsers}
          </span>
          <span className="text-xs text-slate-400 font-medium">Contestants</span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Active in Real-time Standings</span>
        </div>
      </div>

      {/* Total Tickets */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0c1220]/80 backdrop-blur-xl border border-white/[0.08] p-4 sm:p-5 shadow-[0_12px_36px_rgba(0,0,0,0.35)] group hover:border-white/[0.15] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-300">Total Lucky Draw Tickets</span>
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm">
            <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight font-mono">
            {totalTickets}
          </span>
          <span className="text-xs text-slate-400 font-medium">Tickets Earned</span>
        </div>
        <div className="mt-2.5 text-[11px] text-amber-300/90 flex items-center gap-1 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{nearTicketCount} members need just 1 more direct!</span>
        </div>
      </div>

      {/* Top Performer */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0c1220]/80 backdrop-blur-xl border border-amber-500/30 p-4 sm:p-5 shadow-[0_12px_36px_rgba(245,158,11,0.1)] group hover:border-amber-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" /> Current #1 Leader
          </span>
          <div className="p-1.5 px-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-black shadow-sm">
            🥇 #1
          </div>
        </div>
        {topUser ? (
          <>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-base sm:text-lg font-black text-white font-mono tracking-wider">
                {topUser.userId}
              </span>
              <span className="text-xs font-mono font-black text-emerald-300 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 shadow-sm">
                👥 {topUser.directCount} Directs
              </span>
            </div>
            <div className="mt-2.5 text-[11px] text-slate-300 truncate font-medium flex items-center gap-1.5">
              <span>{topUser.name || 'Top Contender'}</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-400 font-bold">🎟️ {topUser.ticketCount} Tickets</span>
            </div>
          </>
        ) : (
          <div className="mt-3 text-sm text-slate-400">No contestants yet</div>
        )}
      </div>
    </div>
  );
};
