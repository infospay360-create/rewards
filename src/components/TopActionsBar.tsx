import React from 'react';
import {
  Coins,
  Gift,
  RefreshCw,
  Sparkles,
  Trophy,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { LeaderboardUser } from '../types';

interface TopActionsBarProps {
  onOpenCashRewards: () => void;
  onOpenGiftsModal: () => void;
  onManualRefresh: () => void;
  isSyncing: boolean;
  isLiveConnected?: boolean;
  totalUsers: number;
  totalTickets: number;
}

export const TopActionsBar: React.FC<TopActionsBarProps> = ({
  onOpenCashRewards,
  onOpenGiftsModal,
  onManualRefresh,
  isSyncing,
  isLiveConnected = true,
  totalUsers,
  totalTickets,
}) => {
  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-slate-800 p-3 sm:p-4 shadow-xl">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Two Prominent Buttons for Top 10 Cash & 40 Lucky Draw Gifts */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Button 1: Top 10 Cash Rewards */}
          <button
            id="open-top10-cash-btn"
            onClick={onOpenCashRewards}
            className="group flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 hover:from-amber-500 hover:to-orange-500 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-slate-950 font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-amber-500/25 cursor-pointer"
          >
            <div className="p-1.5 rounded-lg bg-amber-500/20 group-hover:bg-slate-950/20 text-amber-400 group-hover:text-slate-950 transition-colors">
              <Coins className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] uppercase font-bold text-amber-400/80 group-hover:text-slate-950/80 leading-none">
                Cash Rewards
              </span>
              <span className="block text-xs sm:text-sm font-black tracking-tight leading-snug">
                💰 Top 10 Cash Rewards
              </span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-amber-500/30 group-hover:bg-slate-950/20 text-[10px] font-black uppercase text-amber-300 group-hover:text-slate-950 ml-1">
              Prize Pool
            </span>
          </button>

          {/* Button 2: 40 Lucky Draw Gifts */}
          <button
            id="open-40-gifts-btn"
            onClick={onOpenGiftsModal}
            className="group flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-rose-500/20 hover:from-purple-500 hover:to-pink-500 border border-purple-500/40 hover:border-pink-400 text-pink-300 hover:text-white font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-purple-500/25 cursor-pointer"
          >
            <div className="p-1.5 rounded-lg bg-purple-500/20 group-hover:bg-white/20 text-pink-400 group-hover:text-white transition-colors">
              <Gift className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] uppercase font-bold text-pink-400/80 group-hover:text-white/80 leading-none">
                Mega Draw
              </span>
              <span className="block text-xs sm:text-sm font-black tracking-tight leading-snug">
                🎁 40 Lucky Draw Gifts
              </span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-purple-500/30 group-hover:bg-white/20 text-[10px] font-black uppercase text-pink-200 group-hover:text-white ml-1">
              40 Prizes
            </span>
          </button>
        </div>

        {/* Right: Live Cloud Sync Status across all devices + Manual Refresh */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLiveConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-slate-300 font-medium text-[11px]">
              {isLiveConnected ? (
                <>
                  <span className="text-emerald-400 font-bold">Live Stream</span> • All India Sync
                </>
              ) : (
                <>
                  <span className="text-amber-400 font-bold">Live Synced</span> • All Devices
                </>
              )}
            </span>
          </div>

          <button
            id="manual-refresh-sync-btn"
            onClick={onManualRefresh}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-xs font-bold text-slate-200 transition-all disabled:opacity-50 cursor-pointer"
            title="Fetch latest rankings from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
