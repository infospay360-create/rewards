import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Ticket, Users, Sparkles, Edit2, Shirt, Coins } from 'lucide-react';
import { LeaderboardUser, FilterCategory } from '../types';
import { getRankBadge, padZero, calculateProgressToNextTicket, getCashPrizeForRank } from '../utils/leaderboardUtils';

interface LeaderboardTableProps {
  isAdmin: boolean;
  users: LeaderboardUser[];
  onQuickAddDirect: (userId: string, count?: number) => void;
  onEditUser: (user: LeaderboardUser) => void;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  isAdmin,
  users,
  onQuickAddDirect,
  onEditUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');

  const filteredUsers = useMemo(() => {
    let list = [...users];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.userId.toLowerCase().includes(q) ||
          (u.name && u.name.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filterCategory === 'top10') {
      list = list.slice(0, 10);
    } else if (filterCategory === 'ticket_holders') {
      list = list.filter((u) => u.ticketCount > 0);
    } else if (filterCategory === 'near_ticket') {
      list = list.filter((u) => u.directCount % 5 === 4);
    }

    return list;
  }, [users, searchQuery, filterCategory]);

  return (
    <div className="rounded-2xl bg-[#0c1220]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.45)] overflow-hidden mb-8">
      {/* Header bar of the list */}
      <div className="p-4 sm:p-6 border-b border-white/[0.08] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              LIVE LEADERBOARD RANKINGS
            </span>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#141d30] text-amber-300 border border-amber-500/20 shadow-sm">
              Showing {filteredUsers.length} of {users.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Ranked by Highest Tickets & Highest Directs • Top 10 Win Guaranteed Cash!
          </p>
        </div>

        {/* Search & Category tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search User ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#080d19]/90 border border-white/[0.1] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition shadow-inner font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 p-1 bg-[#080d19]/90 rounded-xl border border-white/[0.08] overflow-x-auto text-xs shadow-inner">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              All ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('top10')}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                filterCategory === 'top10'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Top 10 Cash (10)</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('ticket_holders')}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                filterCategory === 'ticket_holders'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Tickets ({users.filter((u) => u.ticketCount > 0).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('near_ticket')}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                filterCategory === 'near_ticket'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>4 Directs ({users.filter((u) => u.directCount % 5 === 4).length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] bg-[#080d19]/80 text-[11px] font-black text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-20 text-center">Rank</th>
              <th className="py-3.5 px-4">User Details</th>
              <th className="py-3.5 px-4 text-center">Direct Users</th>
              <th className="py-3.5 px-4 text-center">Earned Tickets</th>
              <th className="py-3.5 px-4 text-center">Top 10 Cash Prize</th>
              <th className="py-3.5 px-4 min-w-[170px]">Next Ticket Status</th>
              {isAdmin && <th className="py-3.5 px-4 text-right">Admin Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05] text-sm">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="w-8 h-8 text-slate-600" />
                    <p className="text-base font-semibold text-slate-300">No users match the criteria</p>
                    <p className="text-xs text-slate-500">Try changing your search query or filter</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                // Determine absolute rank in full user list
                const absoluteRank = users.findIndex((u) => u.id === user.id) + 1;
                const badge = getRankBadge(absoluteRank);
                const { needed, currentInCycle, percentage } = calculateProgressToNextTicket(user.directCount);
                const isNearTicket = user.directCount % 5 === 4;
                const cashPrize = getCashPrizeForRank(absoluteRank);
                const hasTshirt = user.directCount >= 5;

                return (
                  <tr
                    key={user.id}
                    id={`user-row-${user.userId}`}
                    className={`group hover:bg-white/[0.03] transition-colors duration-150 ${
                      absoluteRank <= 3 ? 'bg-amber-500/[0.04]' : absoluteRank <= 10 ? 'bg-amber-500/[0.015]' : ''
                    } ${isNearTicket ? 'ring-1 ring-amber-500/30' : ''}`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center justify-center gap-1.5 font-mono font-bold">
                        {absoluteRank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 shadow-sm text-sm">
                            🥇
                          </span>
                        ) : absoluteRank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300/20 border border-slate-300/60 text-slate-200 shadow-sm text-sm">
                            🥈
                          </span>
                        ) : absoluteRank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 border border-amber-600/60 text-amber-400 shadow-sm text-sm">
                            🥉
                          </span>
                        ) : absoluteRank <= 10 ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-[#161f36] border border-amber-500/30 text-amber-300 text-xs font-black shadow-sm">
                            #{padZero(absoluteRank)}
                          </span>
                        ) : (
                          <span className="text-xs sm:text-sm font-semibold text-slate-400">
                            {padZero(absoluteRank)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* User ID & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {/* Monogram Avatar */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          absoluteRank === 1
                            ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black shadow-sm'
                            : absoluteRank === 2
                            ? 'bg-gradient-to-tr from-slate-200 to-slate-400 text-slate-950 font-black shadow-sm'
                            : absoluteRank === 3
                            ? 'bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-black shadow-sm'
                            : 'bg-[#141e33] border border-white/[0.08] text-slate-300'
                        }`}>
                          {user.userId.replace('SPAY', '').slice(0, 2) || 'SP'}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-sm tracking-wide">
                              {user.userId}
                            </span>
                            {isNearTicket && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                                🎯 1 Away!
                              </span>
                            )}
                            {hasTshirt && (
                              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30" title="Free SmartPay360 T-Shirt Earned on 5 Directs!">
                                <Shirt className="w-2.5 h-2.5 text-sky-400" />
                                <span>T-Shirt Won</span>
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-medium">
                            {user.name || `Member ${user.userId.slice(-4)}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Direct Count */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 font-mono font-bold text-emerald-300 text-xs sm:text-sm shadow-sm">
                        <span>👥</span>
                        <span>{padZero(user.directCount)}</span>
                      </div>
                    </td>

                    {/* Ticket Count */}
                    <td className="py-3.5 px-4 text-center">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono font-black text-xs sm:text-sm ${
                          user.ticketCount > 0
                            ? 'bg-amber-500/15 border border-amber-500/35 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                            : 'bg-[#0e1526] border border-white/[0.06] text-slate-500'
                        }`}
                      >
                        <span>🎟️</span>
                        <span>{padZero(user.ticketCount)}</span>
                      </div>
                    </td>

                    {/* Top 10 Cash Prize */}
                    <td className="py-3.5 px-4 text-center">
                      {cashPrize ? (
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono font-black text-xs shadow-sm ${
                            absoluteRank === 1
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-amber-500/10'
                              : absoluteRank === 2
                              ? 'bg-slate-300/20 text-slate-200 border border-slate-400/50'
                              : absoluteRank === 3
                              ? 'bg-amber-700/20 text-amber-400 border border-amber-600/50'
                              : absoluteRank <= 6
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                              : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{cashPrize.formatted} CASH</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs font-mono">—</span>
                      )}
                    </td>

                    {/* Progress to next ticket */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5 max-w-[190px]">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span className="font-medium">
                            {needed === 5 && user.directCount > 0
                              ? 'Next cycle'
                              : `${needed} direct for ticket`}
                          </span>
                          <span className="font-mono font-bold text-amber-300">
                            {currentInCycle}/5
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-white/5">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isNearTicket
                                ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 animate-pulse'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Admin Action Buttons */}
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Quick -1 (Minus Direct) */}
                          <button
                            type="button"
                            onClick={() => onQuickAddDirect(user.userId, -1)}
                            disabled={user.directCount <= 0}
                            className={`px-2 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-0.5 ${
                              user.directCount <= 0
                                ? 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed'
                                : 'bg-rose-600/20 text-rose-300 border-rose-500/30 hover:bg-rose-600 hover:text-white cursor-pointer active:scale-95'
                            }`}
                            title="Minus 1 Direct (-1)"
                          >
                            <Minus className="w-3.5 h-3.5" />
                            <span>-1</span>
                          </button>

                          {/* Quick +1 */}
                          <button
                            type="button"
                            onClick={() => onQuickAddDirect(user.userId, 1)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition cursor-pointer flex items-center gap-0.5 active:scale-95 shadow-sm"
                            title="Add 1 Direct (+1)"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+1</span>
                          </button>

                          {/* Quick +5 */}
                          <button
                            type="button"
                            onClick={() => onQuickAddDirect(user.userId, 5)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition cursor-pointer flex items-center gap-0.5 active:scale-95 shadow-sm"
                            title="Add 5 Directs (+1 Ticket)"
                          >
                            <Ticket className="w-3 h-3" />
                            <span>+5</span>
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => onEditUser(user)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
                            title="Edit User Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
