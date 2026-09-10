import React from 'react';
import { Trophy, Plus, Minus, Coins, Shirt } from 'lucide-react';
import { LeaderboardUser } from '../types';
import { calculateProgressToNextTicket, getCashPrizeForRank } from '../utils/leaderboardUtils';

interface LeaderboardPodiumProps {
  isAdmin: boolean;
  topThree: LeaderboardUser[];
  onQuickAddDirect: (userId: string, count?: number) => void;
  onSelectUser: (user: LeaderboardUser) => void;
  isLight?: boolean;
}

export const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({
  isAdmin,
  topThree,
  onQuickAddDirect,
  onSelectUser,
  isLight = true,
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

    // Styles tailored for Poster Colors vs Dark
    const rankStyles = isLight
      ? {
          1: {
            cardBg: 'bg-gradient-to-b from-[#064e3b] via-[#043d2f] to-[#022c22]',
            border: 'border-2 border-amber-400',
            shadow: 'shadow-[0_16px_45px_rgba(4,120,87,0.35)]',
            ribbonBg: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black',
            ribbonText: '1st CHAMPION',
            userIdColor: 'text-white',
            userNameColor: 'text-emerald-100',
            statBoxBg: 'bg-white text-slate-900 border border-emerald-500/20 shadow-sm',
            statBoxLabel: 'text-slate-500',
            bottomBannerBg: 'bg-[#047857] text-amber-300 border border-amber-400/40',
            bottomBannerText: 'CHAMPION LEADS THE WAY',
            accentRing: 'ring-2 ring-amber-400/50',
          },
          2: {
            cardBg: 'bg-white',
            border: 'border-2 border-[#0284c7]',
            shadow: 'shadow-[0_12px_35px_rgba(2,132,199,0.15)]',
            ribbonBg: 'bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#1e3a8a] text-white font-black',
            ribbonText: '2ND RUNNER-UP',
            userIdColor: 'text-[#0f2942]',
            userNameColor: 'text-slate-600',
            statBoxBg: 'bg-slate-50 text-slate-900 border border-slate-200 shadow-sm',
            statBoxLabel: 'text-slate-500',
            bottomBannerBg: 'bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white',
            bottomBannerText: 'KEEP GOING',
            accentRing: 'ring-1 ring-sky-300',
          },
          3: {
            cardBg: 'bg-white',
            border: 'border-2 border-[#f97316]',
            shadow: 'shadow-[0_12px_35px_rgba(249,115,22,0.15)]',
            ribbonBg: 'bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#fb923c] text-white font-black',
            ribbonText: '3RD PLACE',
            userIdColor: 'text-[#0f2942]',
            userNameColor: 'text-slate-600',
            statBoxBg: 'bg-slate-50 text-slate-900 border border-slate-200 shadow-sm',
            statBoxLabel: 'text-slate-500',
            bottomBannerBg: 'bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white',
            bottomBannerText: 'YOU ARE AMAZING',
            accentRing: 'ring-1 ring-orange-300',
          },
        }[rank as 1 | 2 | 3]!
      : {
          1: {
            cardBg: 'bg-gradient-to-b from-[#1f1707] via-[#111728] to-[#090e1a]',
            border: 'border-amber-400/80',
            shadow: 'shadow-[0_12px_40px_rgba(245,158,11,0.25)]',
            ribbonBg: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black',
            ribbonText: '1st Champion',
            userIdColor: 'text-white',
            userNameColor: 'text-slate-400',
            statBoxBg: 'bg-[#080d19]/90 text-white border border-white/[0.06]',
            statBoxLabel: 'text-slate-400',
            bottomBannerBg: 'bg-[#141e30] text-amber-300 border border-amber-500/30',
            bottomBannerText: 'CHAMPION LEADS THE WAY',
            accentRing: 'ring-1 ring-amber-400/40',
          },
          2: {
            cardBg: 'bg-gradient-to-b from-[#131929] via-[#0f1524] to-[#090e1a]',
            border: 'border-slate-300/50',
            shadow: 'shadow-[0_10px_30px_rgba(203,213,225,0.12)]',
            ribbonBg: 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 font-black',
            ribbonText: '2nd Runner-Up',
            userIdColor: 'text-white',
            userNameColor: 'text-slate-400',
            statBoxBg: 'bg-[#080d19]/90 text-white border border-white/[0.06]',
            statBoxLabel: 'text-slate-400',
            bottomBannerBg: 'bg-[#141e30] text-sky-300 border border-sky-500/30',
            bottomBannerText: 'KEEP GOING',
            accentRing: 'ring-1 ring-slate-400/30',
          },
          3: {
            cardBg: 'bg-gradient-to-b from-[#1c1209] via-[#0f1524] to-[#090e1a]',
            border: 'border-amber-700/60',
            shadow: 'shadow-[0_10px_30px_rgba(180,83,9,0.12)]',
            ribbonBg: 'bg-gradient-to-r from-amber-700 to-amber-600 text-white font-black',
            ribbonText: '3rd Place',
            userIdColor: 'text-white',
            userNameColor: 'text-slate-400',
            statBoxBg: 'bg-[#080d19]/90 text-white border border-white/[0.06]',
            statBoxLabel: 'text-slate-400',
            bottomBannerBg: 'bg-[#141e30] text-amber-400 border border-amber-600/30',
            bottomBannerText: 'YOU ARE AMAZING',
            accentRing: 'ring-1 ring-amber-600/30',
          },
        }[rank as 1 | 2 | 3]!;

    return (
      <div className="flex flex-col items-center flex-1 max-w-[320px]">
        {/* User Card */}
        <div
          onClick={() => onSelectUser(user)}
          className={`w-full relative rounded-3xl ${rankStyles.cardBg} ${rankStyles.border} ${rankStyles.shadow} ${rankStyles.accentRing} p-4 sm:p-5 text-center cursor-pointer hover:scale-[1.02] transition-all duration-300 backdrop-blur-xl group`}
        >
          {/* Floating Arch Ribbon Banner on Top (Exact Poster Style) */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full shadow-lg text-xs font-black tracking-wider uppercase whitespace-nowrap z-10 border border-white/30 drop-shadow-md">
            <span className={`${rankStyles.ribbonBg} px-3 py-1 rounded-full flex items-center gap-1.5`}>
              <span>{medal}</span>
              <span>{rankStyles.ribbonText}</span>
            </span>
          </div>

          <div className="mt-3.5">
            <span className={`text-[10px] font-black tracking-widest uppercase ${isLight && rank !== 1 ? 'text-slate-400' : 'text-emerald-300'}`}>
              RANK #{rank < 10 ? `0${rank}` : rank}
            </span>
            <div className={`text-base sm:text-xl font-black font-mono tracking-wider ${rankStyles.userIdColor} mt-0.5`}>
              {user.userId}
            </div>
            <div className={`text-xs font-bold truncate mt-0.5 ${rankStyles.userNameColor}`}>
              {user.name || `Leader ${user.userId.slice(-4)}`}
            </div>

            {/* Top 3 Cash Reward Badge */}
            {cashPrize && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-xs sm:text-sm font-black shadow-md border border-amber-300">
                <Coins className="w-4 h-4 text-slate-950 fill-amber-900" />
                <span>CASH {cashPrize.formatted}</span>
              </div>
            )}

            {hasTshirt && (
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-700 border border-sky-500/30 text-[10px] font-bold">
                <Shirt className="w-3 h-3 text-sky-600" />
                <span>Free T-Shirt Won</span>
              </div>
            )}
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 gap-2 my-3.5">
            <div className={`p-2.5 rounded-2xl ${rankStyles.statBoxBg} text-center`}>
              <span className={`text-[10px] ${rankStyles.statBoxLabel} block font-semibold`}>Direct Users</span>
              <span className="text-base sm:text-lg font-black text-emerald-600 font-mono tracking-tight">
                👥 {user.directCount < 10 ? `0${user.directCount}` : user.directCount}
              </span>
            </div>
            <div className={`p-2.5 rounded-2xl ${rankStyles.statBoxBg} text-center`}>
              <span className={`text-[10px] ${rankStyles.statBoxLabel} block font-semibold`}>Lucky Tickets</span>
              <span className="text-base sm:text-lg font-black text-orange-600 font-mono tracking-tight">
                🎟️ {user.ticketCount < 10 ? `0${user.ticketCount}` : user.ticketCount}
              </span>
            </div>
          </div>

          {/* Next Ticket progress */}
          <div className={`space-y-1.5 text-left p-2.5 rounded-2xl ${isLight ? (rank === 1 ? 'bg-black/20 text-white' : 'bg-slate-50 text-slate-700 border border-slate-200') : 'bg-[#080d19]/60 text-slate-300'}`}>
            <div className="flex justify-between text-[10px]">
              <span className="font-semibold">Next Ticket Goal</span>
              <span className="font-bold text-amber-500 font-mono">{currentInCycle}/5</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-950 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 transition-all duration-300 shadow-sm"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-[10px] text-center font-semibold opacity-90">
              {needed === 0 ? '🎉 Ticket unlocked!' : `${needed} direct needed for next ticket`}
            </div>
          </div>

          {/* Poster Bottom Ribbon Banner */}
          <div className={`mt-3 py-1 px-2 rounded-xl text-[11px] font-black tracking-wider uppercase shadow-sm flex items-center justify-center gap-1.5 ${rankStyles.bottomBannerBg}`}>
            <span>{rankStyles.bottomBannerText}</span>
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
          className={`w-full ${pedestalHeight} ${pedestalBg} rounded-t-2xl mt-3 flex items-center justify-center border-t-2 border-x border-emerald-500/20 shadow-xl backdrop-blur-md`}
        >
          <div className="text-center font-black text-slate-800 dark:text-slate-200 text-xs sm:text-sm tracking-wider uppercase drop-shadow">
            {medal} {rank === 1 ? '1ST PLACE' : rank === 2 ? '2ND PLACE' : '3RD PLACE'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500 fill-amber-400" />
          <span>Top Position Leaders (Cash Winners)</span>
        </h3>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-600 text-white shadow-sm border border-emerald-500/30">
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
          isLight ? 'bg-gradient-to-t from-sky-200 to-sky-100' : 'bg-gradient-to-t from-slate-900 to-slate-800/90'
        )}

        {/* 1st Place (Elevated in Center) */}
        {renderPodiumCard(
          first,
          1,
          '🥇',
          'h-24 sm:h-28',
          isLight ? 'bg-gradient-to-t from-emerald-800 to-[#047857] text-white' : 'bg-gradient-to-t from-slate-900 to-amber-950/40 border-amber-500/30'
        )}

        {/* 3rd Place */}
        {renderPodiumCard(
          third,
          3,
          '🥉',
          'h-12 sm:h-16',
          isLight ? 'bg-gradient-to-t from-amber-200 to-orange-100' : 'bg-gradient-to-t from-slate-900 to-slate-800/80'
        )}
      </div>
    </div>
  );
};
