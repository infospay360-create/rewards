import React from 'react';
import {
  Coins,
  Gift,
  RefreshCw,
  Sparkles,
  Trophy,
  CheckCircle2,
  Users,
  Database,
} from 'lucide-react';
import { LeaderboardUser } from '../types';

interface TopActionsBarProps {
  onOpenCashRewards: () => void;
  onOpenGiftsModal: () => void;
  onManualRefresh: () => void;
  onOpenSupabaseModal?: () => void;
  isSyncing: boolean;
  isLiveConnected?: boolean;
  isSupabaseLive?: boolean;
  totalUsers: number;
  totalTickets: number;
  isLight?: boolean;
}

export const TopActionsBar: React.FC<TopActionsBarProps> = ({
  onOpenCashRewards,
  onOpenGiftsModal,
  onManualRefresh,
  onOpenSupabaseModal,
  isSyncing,
  isLiveConnected = true,
  isSupabaseLive = true,
  totalUsers,
  totalTickets,
  isLight = true,
}) => {
  return (
    <div
      className={`mb-6 rounded-2xl p-3 sm:p-4 transition-all duration-300 ${
        isLight
          ? 'bg-white/95 border border-emerald-500/20 shadow-[0_8px_30px_rgba(5,150,105,0.06)]'
          : 'bg-[#0c1220]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
      }`}
    >
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Two Prominent Buttons for Top 10 Cash & 40 Lucky Draw Gifts */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Button 1: Top 10 Cash Rewards */}
          <button
            id="open-top10-cash-btn"
            onClick={onOpenCashRewards}
            className="group flex-1 sm:flex-none flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 hover:from-amber-500 hover:via-amber-400 hover:to-orange-500 border border-amber-500/30 hover:border-amber-300 text-amber-300 hover:text-slate-950 font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-md hover:shadow-amber-500/25 active:scale-[0.98] cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-amber-500/20 group-hover:bg-slate-950/20 text-amber-300 group-hover:text-slate-950 transition-colors">
              <Coins className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] uppercase font-black tracking-wider text-amber-400/90 group-hover:text-slate-950/80 leading-none">
                Guaranteed Cash
              </span>
              <span className="block text-xs sm:text-sm font-black tracking-tight leading-snug text-white group-hover:text-slate-950">
                💰 Top 10 Cash Rewards
              </span>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-lg bg-amber-500/20 group-hover:bg-slate-950/20 text-[10px] font-black uppercase text-amber-300 group-hover:text-slate-950 ml-1 border border-amber-500/30 group-hover:border-transparent">
              Prize Pool
            </span>
          </button>

          {/* Button 2: 40 Lucky Draw Gifts */}
          <button
            id="open-40-gifts-btn"
            onClick={onOpenGiftsModal}
            className="group flex-1 sm:flex-none flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/15 via-pink-500/10 to-rose-500/15 hover:from-purple-500 hover:via-pink-500 hover:to-rose-500 border border-purple-500/30 hover:border-pink-300 text-pink-300 hover:text-white font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-md hover:shadow-purple-500/25 active:scale-[0.98] cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-purple-500/20 group-hover:bg-white/20 text-pink-300 group-hover:text-white transition-colors">
              <Gift className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] uppercase font-black tracking-wider text-pink-400/90 group-hover:text-white/80 leading-none">
                Mega Draw
              </span>
              <span className="block text-xs sm:text-sm font-black tracking-tight leading-snug text-white">
                🎁 40 Lucky Draw Gifts
              </span>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-lg bg-purple-500/20 group-hover:bg-white/20 text-[10px] font-black uppercase text-pink-200 group-hover:text-white ml-1 border border-purple-500/30 group-hover:border-transparent">
              40 Prizes
            </span>
          </button>
        </div>

        {/* Right: Live Cloud Sync Status across all devices + Supabase + Manual Refresh */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.08] flex-wrap">
          {onOpenSupabaseModal && (
            <button
              id="open-supabase-modal-btn"
              onClick={onOpenSupabaseModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Supabase PostgreSQL & Realtime details"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase DB</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
          )}

          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs shadow-inner ${
              isLight ? 'bg-slate-100 border border-slate-200' : 'bg-[#090e1a]/90 border border-white/[0.08]'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLiveConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className={`font-semibold text-[11px] ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              {isLiveConnected ? (
                <>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Realtime Live</span> • All Devices
                </>
              ) : (
                <>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">Connecting</span> • Cloud DB
                </>
              )}
            </span>
          </div>

          <button
            id="manual-refresh-sync-btn"
            onClick={onManualRefresh}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl active:scale-95 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm ${
              isLight
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-[#141d30] hover:bg-[#1a2640] text-slate-200 border border-white/[0.08]'
            }`}
            title="Fetch latest rankings from Supabase database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
