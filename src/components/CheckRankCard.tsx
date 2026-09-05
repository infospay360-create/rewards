import React, { useState } from 'react';
import { Search, Trophy, Coins, Sparkles, ArrowRight, UserCheck, Ticket, AlertCircle } from 'lucide-react';
import { LeaderboardUser } from '../types';
import { getCashPrizeForRank, calculateProgressToNextTicket, padZero } from '../utils/leaderboardUtils';

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

  // Compare to user ahead of them
  const aheadUser = searchedUser && searchedUser.rank > 1 ? users[searchedUser.rank - 2] : null;
  const directsToOvertake =
    searchedUser && aheadUser ? aheadUser.directCount - searchedUser.user.directCount + 1 : 0;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 p-5 sm:p-6 shadow-xl mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-indigo-500/20 text-indigo-400">
              <Search className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Check My Live Rank & Cash Prize
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Apna User ID dalo aur apna live rank, direct count, ticket aur cash prize status check karo!
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
            className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:brightness-110 shadow-md shadow-orange-500/20 active:scale-95 transition cursor-pointer"
          >
            Check Rank
          </button>
        </form>
      </div>

      {/* Result Display */}
      {hasSearched && (
        <div className="mt-5 pt-5 border-t border-slate-800 animate-in fade-in">
          {searchedUser ? (
            <div className="rounded-xl bg-slate-950/90 border border-amber-500/40 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xl">
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
                    </div>
                    <div className="text-xs text-slate-400">
                      Current Live Standings in SMARTPAY360 Contest
                    </div>
                  </div>
                </div>

                {/* Cash Prize Status */}
                {cashPrize ? (
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-[10px] text-amber-300 block font-bold uppercase tracking-wider">
                        Qualifying For Cash
                      </span>
                      <span className="text-sm sm:text-base font-black text-white font-mono">
                        💵 {cashPrize.formatted} CASH
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                    <span className="text-amber-400 font-semibold">
                      {searchedUser.rank - 10} ranks away
                    </span>{' '}
                    from Top 10 Cash Prize (₹500+)!
                  </div>
                )}
              </div>

              {/* Breakdown metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Total Directs</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    👥 {searchedUser.user.directCount} Direct
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Earned Tickets</span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    🎟️ {searchedUser.user.ticketCount} Tickets
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Next Ticket</span>
                  <span className="text-sm font-bold text-white">
                    {progress?.needed === 5 && searchedUser.user.directCount > 0
                      ? '5 more needed'
                      : `${progress?.needed} more direct(s)`}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Climb Rank</span>
                  <span className="text-sm font-bold text-indigo-300">
                    {aheadUser && directsToOvertake > 0
                      ? `+${directsToOvertake} to pass #${searchedUser.rank - 1}`
                      : '🏆 At the very top!'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>User ID "{searchId}" not found on the leaderboard. Contact Admin to add your ID!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
