import React, { useState } from 'react';
import { Search, Trophy, Coins, Sparkles, UserCheck, Ticket, AlertCircle, Shirt } from 'lucide-react';
import { LeaderboardUser } from '../types';
import { calculateProgressToNextTicket, padZero, getCashPrizeForRank } from '../utils/leaderboardUtils';

interface CheckRankCardProps {
  users: LeaderboardUser[];
}

export const CheckRankCard: React.FC<CheckRankCardProps> = ({ users }) => {
  const [searchId, setSearchId] = useState('');
  const [searchedUser, setSearchedUser] = useState<{
    user: LeaderboardUser;
    rank: number;
  } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchId.trim().toUpperCase();
    if (!query) return;

    setHasSearched(true);
    const index = users.findIndex(
      (u) => u.userId.toUpperCase() === query || (u.name && u.name.toUpperCase() === query)
    );

    if (index >= 0) {
      setSearchedUser({ user: users[index], rank: index + 1 });
    } else {
      setSearchedUser(null);
    }
  };

  const cashPrize = searchedUser ? getCashPrizeForRank(searchedUser.rank) : null;
  const progress = searchedUser ? calculateProgressToNextTicket(searchedUser.user.directCount) : null;
  const hasTshirt = searchedUser ? searchedUser.user.directCount >= 5 : false;

  // Compare to user ahead of them
  const aheadUser = searchedUser && searchedUser.rank > 1 ? users[searchedUser.rank - 2] : null;
  const directsToOvertake =
    searchedUser && aheadUser ? aheadUser.directCount - searchedUser.user.directCount + 1 : 0;

  return (
    <div className="rounded-2xl bg-[#0c1220]/80 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Search className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
              Check My Live Rank & Lucky Draw Prize
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Enter your User ID to check your live rank, total tickets, and reward eligibility in real time!
          </p>
        </div>

        {/* Input form */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 min-w-[280px] sm:min-w-[340px]">
          <input
            id="input-check-rank"
            type="text"
            placeholder="Enter User ID (e.g. SPAY411819)..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-[#080d19]/90 border border-white/[0.1] rounded-xl text-xs sm:text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition shadow-inner"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-orange-500/20 active:scale-95 transition cursor-pointer"
          >
            Check Rank
          </button>
        </form>
      </div>

      {/* Result Display */}
      {hasSearched && (
        <div className="mt-5 pt-5 border-t border-white/[0.08] animate-in fade-in">
          {searchedUser ? (
            <div className="rounded-2xl bg-[#080d19]/90 border border-amber-500/40 p-4 sm:p-5 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3.5 border-b border-white/[0.08]">
                <div className="flex items-center gap-3.5">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-black text-xl shadow-md">
                    #{padZero(searchedUser.rank)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-white text-base sm:text-lg">
                        {searchedUser.user.userId}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        ({searchedUser.user.name || 'Member'})
                      </span>
                      {hasTshirt ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                          <Shirt className="w-3 h-3 text-sky-400" /> Free T-Shirt Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#141d30] text-slate-400 border border-white/10">
                          👕 {5 - searchedUser.user.directCount} more for T-Shirt
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Current Live Standings in SMARTPAY360 Lucky Draw Contest
                    </div>
                  </div>
                </div>

                {/* Top 10 Cash Prize Status */}
                {cashPrize ? (
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40">
                    <Coins className="w-6 h-6 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-amber-300 block font-bold uppercase tracking-wider">
                        Qualifying for Top 10 Cash Prize
                      </span>
                      <span className="text-base sm:text-lg font-black text-amber-300 font-mono">
                        💵 {cashPrize.formatted} CASH ({cashPrize.badge})
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 bg-[#0e1628] px-3.5 py-2.5 rounded-xl border border-white/[0.08] flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong className="text-amber-400">{searchedUser.rank - 10} ranks away</strong> from Top 10 Cash Prize (₹500+)!
                    </span>
                  </div>
                )}
              </div>

              {/* Breakdown metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-[#0f172a]/70 border border-white/[0.06]">
                  <span className="text-slate-400 block mb-0.5 font-medium">Total Directs</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    👥 {searchedUser.user.directCount} Direct
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0f172a]/70 border border-white/[0.06]">
                  <span className="text-slate-400 block mb-0.5 font-medium">Lucky Draw Tickets</span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    🎟️ {searchedUser.user.ticketCount} Tickets
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0f172a]/70 border border-white/[0.06]">
                  <span className="text-slate-400 block mb-0.5 font-medium">Next Ticket</span>
                  <span className="text-sm font-bold text-white">
                    {progress?.needed === 5 && searchedUser.user.directCount > 0
                      ? '5 more needed'
                      : `${progress?.needed} more direct(s)`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0f172a]/70 border border-white/[0.06]">
                  <span className="text-slate-400 block mb-0.5 font-medium">Climb Rank</span>
                  <span className="text-sm font-bold text-indigo-300">
                    {aheadUser && directsToOvertake > 0
                      ? `+${directsToOvertake} to pass #${searchedUser.rank - 1}`
                      : '🏆 At the very top!'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#080d19]/90 border border-white/[0.08] text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>User ID "{searchId}" not found on the leaderboard. Contact Admin to add your ID!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
