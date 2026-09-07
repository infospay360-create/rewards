import React from 'react';
import { Trophy, Plus, Minus, Coins, Shirt } from 'lucide-react';
import { LeaderboardUser } from '../types';
import { calculateProgressToNextTicket, getCashPrizeForRank } from '../utils/leaderboardUtils';

interface LeaderboardPodiumProps {
  isAdmin: boolean;
  topThree: LeaderboardUser[];
  onQuickAddDirect: (userId: string, count?: number) => void;
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
    const hasTshirt = user.directCount >= 5;

    const rankStyles = {
      1: {
        cardBg: 'bg-gradient-to-b from-[#1f1707] via-[#111728] to-[#090e1a]',
        border: 'border-amber-400/80',
        shadow: 'shadow-[0_12px_40px_rgba(245,158,11,0.25)]',
        badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black',
        label: '1st Champion',
        labelColor: 'text-amber-300',
        accentRing: 'ring-1 ring-amber-400/40',
      },
      2: {
        cardBg: 'bg-gradient-to-b from-[#131929] via-[#0f1524] to-[#090e1a]',
        border: 'border-slate-300/50',
        shadow: 'shadow-[0_10px_30px_rgba(203,213,225,0.12)]',
        badgeBg: 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 font-black',
        label: '2nd Runner-Up',
        labelColor: 'text-slate-300',
        accentRing: 'ring-1 ring-slate-400/30',
      },
      3: {
        cardBg: 'bg-gradient-to-b from-[#1c1209] via-[#0f1524] to-[#090e1a]',
        border: 'border-amber-700/60',
        shadow: 'shadow-[0_10px_30px_rgba(180,83,9,0.12)]',
        badgeBg: 'bg-gradient-to-r from-amber-700 to-amber-600 text-white font-black',
        label: '3rd Place',
        labelColor: 'text-amber-400',
        accentRing: 'ring-1 ring-amber-600/30',
      },
    }[rank as 1 | 2 | 3] || {
      cardBg: 'bg-[#0e1424]',
      border: 'border-white/10',
      shadow: 'shadow-lg',
      badgeBg: 'bg-slate-700 text-white',
      label: `Rank #${rank}`,
      labelColor: 'text-slate-400',
      accentRing: '',
    };

    return (
      <div className="flex flex-col items-center flex-1 max-w-[300px]">
        {/* User Card */}
        <div
          onClick={() => onSelectUser(user)}
          className={`w-full relative rounded-2xl ${rankStyles.cardBg} ${rankStyles.border} ${rankStyles.shadow} ${rankStyles.accentRing} border p-4 sm:p-5 text-center cursor-pointer hover:border-amber-300 transition-all duration-300 transform hover:-translate-y-1.5 backdrop-blur-xl group`}
        >
          {/* Floating Medallion Header */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1 px-3 py-1 rounded-full bg-[#0a0f1d] border border-white/20 shadow-xl text-xs font-black">
            <span className="text-base">{medal}</span>
            <span className={`text-[10px] uppercase tracking-wider ${rankStyles.labelColor}`}>
              {rankStyles.label}
            </span>
          </div>

          <div className="mt-2.5">
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              RANK #{rank < 10 ? `0${rank}` : rank}
            </span>
            <div className="text-base sm:text-lg font-black font-mono tracking-wider text-white mt-0.5 group-hover:text-amber-300 transition-colors">
              {user.userId}
            </div>
            <div className="text-xs text-slate-400 font-medium truncate mt-0.5">
              {user.name || `Leader ${user.userId.slice(-4)}`}
            </div>

            {/* Top 3 Cash Reward Badge */}
            {cashPrize && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black shadow-inner">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>CASH {cashPrize.formatted}</span>
              </div>
            )}

            {hasTshirt && (
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                <Shirt className="w-3 h-3 text-sky-400" />
                <span>Free T-Shirt Unlocked</span>
              </div>
            )}
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 gap-2 my-3.5">
            <div className="p-2.5 rounded-xl bg-[#080d19]/90 border border-white/[0.06] text-center shadow-inner">
              <span className="text-[10px] text-slate-400 block font-semibold">Direct Users</span>
              <span className="text-sm sm:text-base font-black text-emerald-400 font-mono tracking-tight">
                👥 {user.directCount < 10 ? `0${user.directCount}` : user.directCount}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#080d19]/90 border border-white/[0.06] text-center shadow-inner">
              <span className="text-[10px] text-slate-400 block font-semibold">Lucky Tickets</span>
              <span className="text-sm sm:text-base font-black text-amber-400 font-mono tracking-tight">
                🎟️ {user.ticketCount < 10 ? `0${user.ticketCount}` : user.ticketCount}
              </span>
            </div>
          </div>

          {/* Next Ticket progress */}
          <div className="space-y-1.5 text-left bg-[#080d19]/60 p-2 rounded-xl border border-white/[0.04]">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span className="font-medium">Next Ticket Goal</span>
              <span className="font-bold text-amber-300 font-mono">{currentInCycle}/5</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 transition-all duration-300 shadow-sm"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 text-center font-medium">
              {needed === 0 ? '🎉 Ticket unlocked!' : `${needed} direct needed for next ticket`}
            </div>
          </div>

          {/* Quick adjust buttons (Admin only) */}
          {isAdmin && (
            <div className="mt-3.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAddDirect(user.userId, 1);
                }}
                className="py-1.5 rounded-xl text-xs font-bold bg-[#141e30] hover:bg-emerald-600 hover:text-white text-emerald-300 border border-emerald-500/40 hover:border-emerald-500 transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                title="Add +1 direct to this user"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>+1 Direct</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAddDirect(user.userId, -1);
                }}
                disabled={user.directCount <= 0}
                className={`py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 flex items-center justify-center gap-1 ${
                  user.directCount <= 0
                    ? 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed'
                    : 'bg-[#141e30] hover:bg-rose-600 hover:text-white text-rose-300 border-rose-500/40 hover:border-rose-500 cursor-pointer active:scale-95 shadow-sm'
                }`}
                title="Minus -1 direct from this user"
              >
                <Minus className="w-3.5 h-3.5 text-rose-400" />
                <span>-1 Direct</span>
              </button>
            </div>
          )}
        </div>

        {/* Podium Base with Architectural Tier */}
        <div
          className={`w-full ${pedestalHeight} ${pedestalBg} rounded-t-2xl mt-3 flex items-center justify-center border-t-2 border-x border-white/10 shadow-xl backdrop-blur-md`}
        >
          <div className="text-center font-black text-slate-200 text-xs sm:text-sm tracking-wider uppercase drop-shadow">
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
          <span>Top Position Leaders (Cash Winners)</span>
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
