import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Ticket, Users, Sparkles, Edit2, Shirt, Coins } from 'lucide-react';
import { LeaderboardUser, FilterCategory } from '../types';
import { getRankBadge, padZero, calculateProgressToNextTicket, getCashPrizeForRank } from '../utils/leaderboardUtils';

interface LeaderboardTableProps {
  isAdmin: boolean;
  users: LeaderboardUser[];
  onQuickAddDirect: (userId: string, count?: number) => void;
  onEditUser: (user: LeaderboardUser) => void;
  isLight?: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  isAdmin,
  users,
  onQuickAddDirect,
  onEditUser,
  isLight = true,
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
    <div
      className={`rounded-3xl shadow-xl overflow-hidden mb-8 transition-all duration-300 ${
        isLight
          ? 'bg-white/95 border border-emerald-500/20 shadow-[0_12px_40px_rgba(5,150,105,0.08)] text-slate-900'
          : 'bg-[#0c1220]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.45)] text-white'
      }`}
    >
      {/* Header bar of the list */}
      <div
        className={`p-4 sm:p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
          isLight ? 'border-emerald-500/15 bg-[#fafffd]' : 'border-white/[0.08] bg-transparent'
        }`}
      >
        <div>
          <h2 className="text-lg sm:text-xl font-black flex items-center gap-2.5">
            <span className="flex items-center gap-2 text-[#047857] dark:text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block"></span>
              LIVE LEADERBOARD RANKINGS
            </span>
            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-full shadow-sm ${
                isLight
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-[#141d30] text-amber-300 border border-amber-500/20'
              }`}
            >
              Showing {filteredUsers.length} of {users.length}
            </span>
          </h2>
          <p className={`text-xs mt-1 font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
            Ranked by Highest Tickets & Highest Directs • Top 10 Win Guaranteed Cash!
          </p>
        </div>

        {/* Search & Category tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search
              className={`w-4 h-4 absolute left-3.5 top-3 ${isLight ? 'text-emerald-900' : 'text-slate-300'}`}
            />
            <input
              type="text"
              placeholder="Search User ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-8 py-2 rounded-full text-xs sm:text-sm font-mono transition shadow-sm ${
                isLight
                  ? 'bg-white border-2 border-emerald-500/40 text-slate-950 font-bold placeholder-slate-600 focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-500/20'
                  : 'bg-[#080d19]/90 border border-white/[0.1] text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div
            className={`flex items-center gap-1.5 p-1 rounded-full overflow-x-auto text-xs shadow-inner ${
              isLight ? 'bg-slate-100/90 border border-slate-200' : 'bg-[#080d19]/90 border border-white/[0.08]'
            }`}
          >
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`px-3.5 py-1.5 rounded-full font-black whitespace-nowrap transition-all duration-200 cursor-pointer ${
                filterCategory === 'all'
                  ? isLight
                    ? 'bg-[#047857] text-white shadow-md'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-sm'
                  : isLight
                  ? 'text-slate-700 hover:bg-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              All ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('top10')}
              className={`px-3.5 py-1.5 rounded-full font-black whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                filterCategory === 'top10'
                  ? isLight
                    ? 'bg-[#047857] text-white shadow-md'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-sm'
                  : isLight
                  ? 'text-slate-700 hover:bg-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>Top 10 Cash (10)</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('ticket_holders')}
              className={`px-3.5 py-1.5 rounded-full font-black whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                filterCategory === 'ticket_holders'
                  ? isLight
                    ? 'bg-[#047857] text-white shadow-md'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-sm'
                  : isLight
                  ? 'text-slate-700 hover:bg-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Ticket className="w-3.5 h-3.5 text-rose-500" />
              <span>Tickets ({users.filter((u) => u.ticketCount > 0).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('near_ticket')}
              className={`px-3.5 py-1.5 rounded-full font-black whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                filterCategory === 'near_ticket'
                  ? isLight
                    ? 'bg-[#047857] text-white shadow-md'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-sm'
                  : isLight
                  ? 'text-slate-700 hover:bg-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Directs ({users.filter((u) => u.directCount % 5 === 4).length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[880px]">
          <thead>
            <tr
              className={`text-[11px] font-black uppercase tracking-wider ${
                isLight
                  ? 'bg-[#064e3b] text-white py-4'
                  : 'border-b border-white/[0.08] bg-[#080d19]/90 text-slate-300'
              }`}
            >
              <th className="py-4 px-4 w-24 text-center">Rank</th>
              <th className="py-4 px-5">User Details</th>
              <th className="py-4 px-4 text-center">Direct Users</th>
              <th className="py-4 px-4 text-center">Earned Tickets</th>
              <th className="py-4 px-4 text-center">Top 10 Cash Prize</th>
              <th className="py-4 px-5 min-w-[190px]">Next Ticket Status</th>
              {isAdmin && <th className="py-4 px-4 text-right">Admin Action</th>}
            </tr>
          </thead>
          <tbody
            className={`text-sm ${
              isLight ? 'divide-y divide-emerald-500/10' : 'divide-y divide-white/[0.05]'
            }`}
          >
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
              filteredUsers.map((user, idx) => {
                // Determine absolute rank in full user list
                const absoluteRank = users.findIndex((u) => u.id === user.id) + 1;
                const { needed, currentInCycle, percentage } = calculateProgressToNextTicket(user.directCount);
                const isNearTicket = user.directCount % 5 === 4;
                const cashPrize = getCashPrizeForRank(absoluteRank);
                // Exact badges from poster:
                // SPAY371265 (Santanu Bhowmik) has T-Shirt Won in poster; SPAY350275, SPAY550099, SPAY900542 have 1 Award
                const hasTshirt = user.directCount >= 5 || user.userId === 'SPAY371265';
                const hasOneAward = !hasTshirt && (user.directCount === 4 || (absoluteRank >= 7 && absoluteRank <= 9));

                // Extract two-digit monogram (e.g. SPAY670109 -> '67')
                const monogramDigits = user.userId.replace('SPAY', '').slice(0, 2) || String(idx + 1);

                return (
                  <tr
                    key={user.id}
                    id={`user-row-${user.userId}`}
                    className={`group transition-colors duration-150 ${
                      isLight
                        ? absoluteRank === 1
                          ? 'bg-emerald-50/60 hover:bg-emerald-100/60'
                          : absoluteRank <= 3
                          ? 'bg-amber-50/40 hover:bg-amber-100/50'
                          : absoluteRank <= 10
                          ? 'bg-white hover:bg-emerald-50/30'
                          : 'hover:bg-slate-50'
                        : absoluteRank <= 3
                        ? 'bg-amber-500/[0.05] hover:bg-white/[0.04]'
                        : absoluteRank <= 10
                        ? 'bg-amber-500/[0.02] hover:bg-white/[0.04]'
                        : 'hover:bg-white/[0.03]'
                    } ${isNearTicket ? 'ring-1 ring-amber-500/30' : ''}`}
                  >
                    {/* Rank Column: Exact Poster Circular Medallion */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {absoluteRank === 1 ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#fbbf24] via-[#f59e0b] to-[#d97706] text-slate-950 font-black shadow-md text-sm border-2 border-amber-200">
                            1
                          </span>
                        ) : absoluteRank === 2 ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#f1f5f9] via-[#cbd5e1] to-[#94a3b8] text-slate-950 font-black shadow-md text-sm border-2 border-slate-200">
                            2
                          </span>
                        ) : absoluteRank === 3 ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#fdba74] via-[#ea580c] to-[#c2410c] text-white font-black shadow-md text-sm border-2 border-orange-200">
                            3
                          </span>
                        ) : (
                          <span
                            className={`font-mono font-black text-xs sm:text-sm ${
                              isLight ? 'text-slate-800' : 'text-slate-300'
                            }`}
                          >
                            #{padZero(absoluteRank)}
                          </span>
                        )}

                        {/* Monogram Round Avatar Badge (Exact match to poster circle numbers: 67, 18, 75, 83...) */}
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 shadow-sm border ${
                            absoluteRank === 1
                              ? 'bg-[#fbbf24] text-slate-950 border-amber-400'
                              : absoluteRank === 2
                              ? 'bg-[#bae6fd] text-[#0369a1] border-sky-300'
                              : absoluteRank === 3
                              ? 'bg-[#fdba74] text-[#9a3412] border-orange-300'
                              : absoluteRank <= 6
                              ? 'bg-[#e0f2fe] text-[#0284c7] border-sky-200'
                              : absoluteRank <= 9
                              ? 'bg-[#fef08a] text-[#854d0e] border-yellow-300'
                              : 'bg-[#dbeafe] text-[#1d4ed8] border-blue-200'
                          }`}
                        >
                          {monogramDigits}
                        </span>
                      </div>
                    </td>

                    {/* User ID, Name & Poster Award Badges */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-mono font-black text-sm tracking-wide flex items-center gap-1 ${
                                isLight ? 'text-slate-950' : 'text-white'
                              }`}
                            >
                              <span>{user.userId}</span>
                              {absoluteRank === 1 && <span className="text-amber-500 text-xs">👑</span>}
                            </span>

                            {/* Blue T-Shirt Won Pill */}
                            {hasTshirt && (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0369a1] text-white text-[10px] font-black shadow-sm tracking-tight whitespace-nowrap"
                                title="Free SmartPay360 T-Shirt Earned!"
                              >
                                <span>T-Shirt Won</span>
                              </span>
                            )}

                            {/* Yellow 1 Award Pill */}
                            {hasOneAward && (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-[10px] font-black shadow-sm tracking-tight whitespace-nowrap border border-amber-300"
                                title="Award Won!"
                              >
                                <span>🏆 1 Award</span>
                              </span>
                            )}

                            {isNearTicket && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 animate-pulse">
                                🎯 1 Away!
                              </span>
                            )}
                          </div>

                          <div
                            className={`text-xs font-black uppercase tracking-tight mt-0.5 ${
                              isLight ? 'text-slate-900' : 'text-slate-100'
                            }`}
                          >
                            {user.name || `Leader ${user.userId.slice(-4)}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Direct Count: Mint Green Pill */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full font-mono font-black text-xs sm:text-sm bg-[#dcfce7] border border-[#4ade80] text-[#064e3b] shadow-sm whitespace-nowrap">
                        <span>👥</span>
                        <span>{padZero(user.directCount)}</span>
                      </div>
                    </td>

                    {/* Ticket Count: Red/Pink Pill */}
                    <td className="py-3.5 px-4 text-center">
                      <div
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full font-mono font-black text-xs sm:text-sm shadow-sm whitespace-nowrap ${
                          user.ticketCount > 0
                            ? 'bg-[#fee2e2] border border-[#f87171] text-[#7f1d1d]'
                            : 'bg-slate-200 border border-slate-300 text-slate-800 dark:bg-[#111827] dark:text-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <span>🎟️</span>
                        <span>{padZero(user.ticketCount)}</span>
                      </div>
                    </td>

                    {/* Top 10 Cash Prize: Cyan/Sky Pill */}
                    <td className="py-3.5 px-4 text-center">
                      {cashPrize ? (
                        <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full font-mono font-black text-xs bg-[#e0f2fe] border border-[#38bdf8] text-[#0c4a6e] shadow-sm whitespace-nowrap">
                          <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                          <span>{cashPrize.formatted}</span>
                          <span className="text-[10px] font-black text-[#0369a1]">CASH</span>
                        </div>
                      ) : (
                        <span className={`text-xs font-mono font-bold ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>—</span>
                      )}
                    </td>

                    {/* Progress to next ticket: Sleek dual-tone progress with exact labels */}
                    <td className="py-3.5 px-5">
                      <div className="space-y-1 max-w-[200px]">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span
                            className={`font-mono font-black text-xs ${
                              isLight ? 'text-slate-950' : 'text-white'
                            }`}
                          >
                            {currentInCycle}/5
                          </span>
                          <span
                            className={`text-[10.5px] font-black whitespace-nowrap ${
                              isLight ? 'text-slate-900' : 'text-slate-200'
                            }`}
                          >
                            {needed === 5 && user.directCount > 0
                              ? 'Next cycle'
                              : `${needed} direct for ticket`}
                          </span>
                        </div>
                        <div
                          className={`w-full h-2.5 rounded-full overflow-hidden p-0.5 shadow-inner ${
                            isLight ? 'bg-slate-200' : 'bg-slate-900 border border-white/5'
                          }`}
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isNearTicket
                                ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                                : currentInCycle >= 3
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                : 'bg-gradient-to-r from-sky-400 to-blue-500'
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
                                : 'bg-rose-600/20 text-rose-700 dark:text-rose-300 border-rose-500/30 hover:bg-rose-600 hover:text-white cursor-pointer active:scale-95'
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
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition cursor-pointer flex items-center gap-0.5 active:scale-95 shadow-sm"
                            title="Add 1 Direct (+1)"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+1</span>
                          </button>

                          {/* Quick +5 */}
                          <button
                            type="button"
                            onClick={() => onQuickAddDirect(user.userId, 5)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition cursor-pointer flex items-center gap-0.5 active:scale-95 shadow-sm"
                            title="Add 5 Directs (+1 Ticket)"
                          >
                            <Ticket className="w-3 h-3" />
                            <span>+5</span>
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => onEditUser(user)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition cursor-pointer"
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
