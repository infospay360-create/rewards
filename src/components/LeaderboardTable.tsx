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
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden mb-8">
      {/* Header bar of the list */}
      <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <span>LIVE LEADERBOARD RANKINGS</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Showing {filteredUsers.length} of {users.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by Highest Tickets & Highest Directs • Top 10 Win Guaranteed Cash!
          </p>
        </div>

        {/* Search & Category tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search User ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('top10')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                filterCategory === 'top10'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Top 10 Cash (10)</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('ticket_holders')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                filterCategory === 'ticket_holders'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Tickets ({users.filter((u) => u.ticketCount > 0).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('near_ticket')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                filterCategory === 'near_ticket'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
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
            <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 w-20 text-center">Rank</th>
              <th className="py-3 px-4">User Details</th>
              <th className="py-3 px-4 text-center">Direct Users</th>
              <th className="py-3 px-4 text-center">Earned Tickets</th>
              <th className="py-3 px-4 text-center">Top 10 Cash Prize</th>
              <th className="py-3 px-4 min-w-[170px]">Next Ticket Status</th>
              {isAdmin && <th className="py-3 px-4 text-right">Admin Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
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
                    className={`group hover:bg-slate-800/50 transition-colors ${
                      absoluteRank <= 3 ? 'bg-amber-500/[0.03]' : ''
                    } ${isNearTicket ? 'ring-1 ring-amber-500/20' : ''}`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 font-mono font-bold">
                        <span className="text-lg">{badge.emoji}</span>
                        <span className={`text-xs sm:text-sm ${badge.textClass}`}>
                          {padZero(absoluteRank)}
                        </span>
                      </div>
                    </td>

                    {/* User ID & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-sm tracking-wide">
                              {user.userId}
                            </span>
                            {isNearTicket && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                🎯 1 Away!
                              </span>
                            )}
                            {hasTshirt && (
                              <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30" title="Free SmartPay360 T-Shirt Earned on 5 Directs!">
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
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 font-mono font-bold text-emerald-400 text-sm">
                        <span>👥</span>
                        <span>{padZero(user.directCount)}</span>
                      </div>
                    </td>

                    {/* Ticket Count */}
                    <td className="py-3.5 px-4 text-center">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono font-black text-sm ${
                          user.ticketCount > 0
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
                            : 'bg-slate-800/50 border border-slate-800 text-slate-400'
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
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
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
                      <div className="space-y-1 max-w-[190px]">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>
                            {needed === 5 && user.directCount > 0
                              ? 'Next round'
                              : `${needed} direct for ticket`}
                          </span>
                          <span className="font-mono font-semibold text-slate-300">
                            {currentInCycle}/5
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isNearTicket
                                ? 'bg-gradient-to-r from-amber-400 to-orange-500 animate-pulse'
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
                            className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-0.5 ${
                              user.directCount <= 0
                                ? 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed'
                                : 'bg-rose-600/20 text-rose-300 border-rose-500/30 hover:bg-rose-600 hover:text-white cursor-pointer'
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
                            className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition cursor-pointer flex items-center gap-0.5"
                            title="Add 1 Direct (+1)"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+1</span>
                          </button>

                          {/* Quick +5 */}
                          <button
                            type="button"
                            onClick={() => onQuickAddDirect(user.userId, 5)}
                            className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition cursor-pointer flex items-center gap-0.5"
                            title="Add 5 Directs (+1 Ticket)"
                          >
                            <Ticket className="w-3 h-3" />
                            <span>+5</span>
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => onEditUser(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
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
