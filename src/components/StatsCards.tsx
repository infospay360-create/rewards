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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/60 p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-slate-400">Total Users</span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {totalUsers}
          </span>
          <span className="text-xs text-slate-400 font-medium">Contestants</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Active on Leaderboard</span>
        </div>
      </div>

      {/* Total Tickets */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/60 p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-slate-400">Total Tickets</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
            {totalTickets}
          </span>
          <span className="text-xs text-slate-400 font-medium">Earned</span>
        </div>
        <div className="mt-2 text-[11px] text-amber-300/80 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{nearTicketCount} users need just 1 more!</span>
        </div>
      </div>

      {/* Top Performer */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-800/80 to-slate-900/90 border border-amber-500/30 p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-amber-300 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Rank #1 Leader
          </span>
          <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            🥇
          </div>
        </div>
        {topUser ? (
          <>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-base sm:text-lg font-black text-white font-mono tracking-wider">
                {topUser.userId}
              </span>
              <span className="text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                👥 {topUser.directCount} Directs
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 truncate">
              {topUser.name || 'Top Contender'} • 🎟️ {topUser.ticketCount} Tickets
            </div>
          </>
        ) : (
          <div className="mt-3 text-sm text-slate-400">No users yet</div>
        )}
      </div>
    </div>
  );
};
