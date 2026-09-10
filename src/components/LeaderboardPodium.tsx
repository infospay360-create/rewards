import React from 'react';
import { Trophy, Plus, Minus, Coins, Shirt, Crown, Sparkles } from 'lucide-react';
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
            userIdColor: 'text-white font-black',
            userNameColor: 'text-emerald-100 font-black',
            statBoxBg: 'bg-white text-slate-950 border border-emerald-500/30 shadow-sm',
            statBoxLabel: 'text-slate-800 font-bold',
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
            userIdColor: 'text-slate-950 font-black',
            userNameColor: 'text-slate-900 font-black',
            statBoxBg: 'bg-slate-50 text-slate-950 border border-slate-300 shadow-sm',
            statBoxLabel: 'text-slate-800 font-bold',
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
            userIdColor: 'text-slate-950 font-black',
            userNameColor: 'text-slate-900 font-black',
            statBoxBg: 'bg-slate-50 text-slate-950 border border-slate-300 shadow-sm',
            statBoxLabel: 'text-slate-800 font-bold',
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
      <div className="flex flex-col items-center flex-1 max-w-[320px] relative">
        {/* Top Trophy Graphic Icon (Exact Poster 3D Trophy with Rank Numeral) */}
        <div className="relative z-10 -mb-5 flex flex-col items-center">
          {rank === 1 ? (
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 p-2 shadow-[0_10px_25px_rgba(245,158,11,0.45)] border-2 border-yellow-200 flex flex-col items-center justify-center transform hover:rotate-3 transition duration-300">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-slate-950 fill-amber-300" />
                <span className="text-[11px] font-black text-slate-950 -mt-1">#1</span>
              </div>
              <span className="absolute -top-1 -right-2 text-xl animate-bounce">👑</span>
            </div>
          ) : rank === 2 ? (
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-300 p-2 shadow-[0_8px_20px_rgba(148,163,184,0.35)] border-2 border-slate-200 flex flex-col items-center justify-center">
              <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-slate-800 fill-slate-300" />
              <span className="text-[10px] font-black text-slate-900 -mt-1">#2</span>
            </div>
          ) : (
            <div className="relative">
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-700 via-orange-600 to-amber-500 p-2 shadow-[0_8px_20px_rgba(234,88,12,0.35)] border-2 border-orange-300 flex flex-col items-center justify-center text-white">
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-orange-300" />
                <span className="text-[10px] font-black text-white -mt-1">#3</span>
              </div>
              {/* Poster Badge: "Small Steps Big Rewards" */}
              <div
                className="absolute -top-6 -right-12 hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-md whitespace-nowrap border border-emerald-400 rotate-6"
                style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive, sans-serif" }}
              >
                <span>Small Steps Big Rewards</span>
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div
          onClick={() => onSelectUser(user)}
          className={`w-full relative rounded-3xl ${rankStyles.cardBg} ${rankStyles.border} ${rankStyles.shadow} ${rankStyles.accentRing} pt-7 pb-5 px-4 sm:px-5 text-center cursor-pointer hover:scale-[1.02] transition-all duration-300 backdrop-blur-xl group`}
        >
          {/* Floating Arch Ribbon Banner on Top (Exact Poster Style) */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 px-3 py-1 rounded-full shadow-md text-xs font-black tracking-wider uppercase whitespace-nowrap z-10 border border-white/30">
            <span className={`${rankStyles.ribbonBg} px-3 py-0.5 rounded-full flex items-center gap-1.5`}>
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
          <div className={`space-y-1.5 text-left p-2.5 rounded-2xl ${isLight ? (rank === 1 ? 'bg-black/25 text-white' : 'bg-slate-100 text-slate-950 border border-slate-300') : 'bg-[#080d19]/80 text-white'}`}>
            <div className="flex justify-between text-[10px]">
              <span className="font-extrabold text-slate-950 dark:text-white">Next Ticket Goal</span>
              <span className="font-black text-amber-500 font-mono">{currentInCycle}/5</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-300 dark:bg-slate-950 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 transition-all duration-300 shadow-sm"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-[10px] text-center font-black text-slate-950 dark:text-slate-200">
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
      {/* Top Position Leaders (Cash Winners) - Dedicated Orange Block */}
      <div className="mb-6 rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#c2410c] text-white shadow-xl shadow-orange-600/25 border-2 border-orange-300/40 relative overflow-hidden">
        {/* Subtle glow background */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-200 border border-white/30 shadow-inner shrink-0">
              <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-300 fill-yellow-400 drop-shadow-md" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <h3 className="text-lg sm:text-2xl font-black tracking-tight text-white drop-shadow-sm uppercase flex items-center gap-2">
                  <span>Top Position Leaders (Cash Winners)</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-yellow-300 text-[11px] font-black tracking-wider uppercase border border-yellow-400/40 inline-flex items-center gap-1">
                  <Crown className="w-3 h-3 text-yellow-300" />
                  <span>Rank #1 to #3 Podium</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-orange-100 mt-1 flex items-center gap-1.5 justify-center sm:justify-start flex-wrap">
                <span>Top 3 Champions on Podium</span>
                <span>•</span>
                <span>Guaranteed Cash Prize Pool</span>
                <span>•</span>
                <span className="text-yellow-200 font-extrabold">Win More, Inspire More</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap justify-center">
            <div className="px-3.5 py-1.5 rounded-xl bg-black/25 backdrop-blur-md border border-white/20 text-center shadow-sm">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-orange-200">1st Prize</span>
              <span className="text-xs sm:text-sm font-black text-yellow-300 font-mono">₹4,000 CASH</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-black/25 backdrop-blur-md border border-white/20 text-center shadow-sm">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-orange-200">2nd Prize</span>
              <span className="text-xs sm:text-sm font-black text-slate-100 font-mono">₹2,000 CASH</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-black/25 backdrop-blur-md border border-white/20 text-center shadow-sm">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-orange-200">3rd Prize</span>
              <span className="text-xs sm:text-sm font-black text-amber-200 font-mono">₹1,000 CASH</span>
            </div>
          </div>
        </div>
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
