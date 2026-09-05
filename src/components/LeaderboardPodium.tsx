import React from 'react';
import { Trophy, Plus, Coins } from 'lucide-react';
import { LeaderboardUser } from '../types';
import { calculateProgressToNextTicket, getCashPrizeForRank } from '../utils/leaderboardUtils';

interface LeaderboardPodiumProps {
  isAdmin: boolean;
  topThree: LeaderboardUser[];
  onQuickAddDirect: (userId: string) => void;
  onSelectUser: (user: LeaderboardUser) => void;
}

export const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({
  isAdmin,
  topThree,
  onQuickAddDirect,
  onSelectUser,
}) => {
  if (topThree.length < 3) return null;

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  const renderPodiumCard = (
    user: LeaderboardUser,
    rank: number,
    medal: string,
    pedestalHeight: string,
    pedestalBg: string
  ) => {
    const { needed, currentInCycle, percentage } = calculateProgressToNextTicket(user.directCount);
    const cashPrize = getCashPrizeForRank(rank);

    return (
      <div className="flex flex-col items-center flex-1 max-w-[280px]">
        {/* User Card */}
        <div
          onClick={() => onSelectUser(user)}
          className={`w-full relative rounded-2xl bg-gradient-to-b ${
            rank === 1
              ? 'from-amber-950/50 via-slate-800 to-slate-900 border-amber-400/60 shadow-amber-500/20 shadow-xl'
              : rank === 2
              ? 'from-slate-800 via-slate-850 to-slate-900 border-slate-400/40 shadow-slate-400/10 shadow-lg'
              : 'from-amber-950/30 via-slate-800 to-slate-900 border-amber-600/40 shadow-amber-700/10 shadow-lg'
          } border p-4 sm:p-5 text-center cursor-pointer hover:border-amber-400/80 transition-all transform hover:-translate-y-1`}
        >
          {/* Medal Float */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 shadow-md text-base">
            {medal}
          </div>

          <div className="mt-2">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              RANK #{rank < 10 ? `0${rank}` : rank}
            </span>
            <div className="text-base sm:text-lg font-black font-mono tracking-wider text-white mt-0.5">
              {user.userId}
            </div>
            <div className="text-xs text-slate-400 font-medium truncate mt-0.5">
              {user.name || `Leader ${user.userId.slice(-4)}`}
            </div>

            {/* Cash Prize Highlight */}
            {cashPrize && (
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black font-mono">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>💵 {cashPrize.formatted} CASH</span>
              </div>
            )}
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 gap-2 my-3">
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Directs</span>
              <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                👥 {user.directCount < 10 ? `0${user.directCount}` : user.directCount}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Tickets</span>
              <span className="text-sm sm:text-base font-black text-amber-400 font-mono">
                🎟️ {user.ticketCount < 10 ? `0${user.ticketCount}` : user.ticketCount}
              </span>
            </div>
          </div>

          {/* Next Ticket progress */}
          <div className="space-y-1 text-left">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Next Ticket Progress</span>
              <span className="font-semibold text-amber-300">{currentInCycle}/5</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 text-center">
              {needed === 0 ? 'Ticket ready!' : `${needed} direct needed for next ticket`}
            </div>
          </div>

          {/* Quick add button (Admin only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAddDirect(user.userId);
              }}
              className="mt-3 w-full py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 border border-slate-700 hover:border-emerald-500 transition flex items-center justify-center gap-1 cursor-pointer"
              title="Add +1 direct to this user"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>+1 Direct</span>
            </button>
          )}
        </div>

        {/* Podium Base */}
        <div
          className={`w-full ${pedestalHeight} ${pedestalBg} rounded-t-xl mt-3 flex items-center justify-center border-t border-x border-slate-700/50 shadow-inner`}
        >
          <div className="text-center font-black text-slate-300 text-xs sm:text-sm">
            {medal} {rank === 1 ? '1ST PLACE' : rank === 2 ? '2ND PLACE' : '3RD PLACE'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>Top Podium Leaders (Cash Winners)</span>
        </h3>
        <span className="text-xs text-amber-400 font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          Rank #1 to #3 Cash Positions
        </span>
      </div>

      <div className="flex items-end justify-center gap-2 sm:gap-4 pt-4">
        {/* 2nd Place */}
        {renderPodiumCard(
          second,
          2,
          '🥈',
          'h-16 sm:h-20',
          'bg-gradient-to-t from-slate-900 to-slate-800/90'
        )}

        {/* 1st Place (Elevated in Center) */}
        {renderPodiumCard(
          first,
          1,
          '🥇',
          'h-24 sm:h-28',
          'bg-gradient-to-t from-slate-900 to-amber-950/40 border-amber-500/30'
        )}

        {/* 3rd Place */}
        {renderPodiumCard(
          third,
          3,
          '🥉',
          'h-12 sm:h-16',
          'bg-gradient-to-t from-slate-900 to-slate-800/80'
        )}
      </div>
    </div>
  );
};
