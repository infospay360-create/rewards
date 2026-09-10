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
  Layers,
} from 'lucide-react';
import { LeaderboardUser } from '../types';

export type MainSectionTab = 'leaderboard' | 'cash' | 'lucky_draw' | 'all';

interface TopActionsBarProps {
  activeSection: MainSectionTab;
  onChangeSection: (section: MainSectionTab) => void;
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
  activeSection,
  onChangeSection,
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
      className={`mb-6 rounded-3xl p-3 sm:p-4 transition-all duration-300 border-2 ${
        isLight
          ? 'bg-white/95 border-emerald-500/30 shadow-[0_12px_35px_rgba(5,150,105,0.08)]'
          : 'bg-[#0c1220]/90 backdrop-blur-xl border-white/[0.1] shadow-[0_12px_35px_rgba(0,0,0,0.5)]'
      }`}
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
        {/* Left: 3D HD Section Tabs (Simple, Clean, Non-Duplicating) */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-[#060a14] border border-slate-200 dark:border-white/10">
          {/* Tab 1: Leaderboard */}
          <button
            id="tab-btn-leaderboard"
            onClick={() => onChangeSection('leaderboard')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer ${
              activeSection === 'leaderboard'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-700/30 border border-emerald-400/40 scale-[1.02]'
                : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
            }`}
          >
            <Trophy className={`w-4 h-4 ${activeSection === 'leaderboard' ? 'text-amber-300' : 'text-amber-500'}`} />
            <span>Leaderboard</span>
          </button>

          {/* Tab 2: Top 10 Cash Rewards */}
          <button
            id="tab-btn-cash"
            onClick={() => onChangeSection('cash')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer ${
              activeSection === 'cash'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-md shadow-amber-600/30 border border-amber-300 scale-[1.02]'
                : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
            }`}
          >
            <Coins className={`w-4 h-4 ${activeSection === 'cash' ? 'text-slate-950 fill-slate-950' : 'text-amber-500 fill-amber-500'}`} />
            <span>10 Cash Rewards</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
              activeSection === 'cash' ? 'bg-slate-950 text-amber-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
            }`}>
              Guaranteed
            </span>
          </button>

          {/* Tab 3: 40 Lucky Draw Gifts */}
          <button
            id="tab-btn-luckydraw"
            onClick={() => onChangeSection('lucky_draw')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer ${
              activeSection === 'lucky_draw'
                ? 'bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#c2410c] text-white shadow-md shadow-orange-600/30 border border-orange-300/60 scale-[1.02]'
                : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
            }`}
          >
            <Gift className={`w-4 h-4 ${activeSection === 'lucky_draw' ? 'text-yellow-200' : 'text-orange-500'}`} />
            <span>40 Lucky Draw</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
              activeSection === 'lucky_draw' ? 'bg-black/30 text-yellow-200' : 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300'
            }`}>
              Prizes
            </span>
          </button>

          {/* Tab 4: All in One view */}
          <button
            id="tab-btn-all"
            onClick={() => onChangeSection('all')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer ${
              activeSection === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="View Leaderboard, Top 10 Cash, and 40 Lucky Draw all in one screen"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All In One</span>
          </button>
        </div>

        {/* Right: Live Cloud Sync Status across all devices + Supabase + Manual Refresh */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-white/[0.08] flex-wrap">
          {onOpenSupabaseModal && (
            <button
              id="open-supabase-modal-btn"
              onClick={onOpenSupabaseModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-xs font-black transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Supabase PostgreSQL & Realtime details"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase DB</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
          )}

          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs shadow-inner ${
              isLight ? 'bg-slate-100 border border-slate-300' : 'bg-[#090e1a]/90 border border-white/[0.08]'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLiveConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className={`font-black text-[11px] ${isLight ? 'text-slate-950' : 'text-slate-200'}`}>
              {isLiveConnected ? (
                <>
                  <span className="text-emerald-700 dark:text-emerald-400 font-black">Realtime Live</span>
                </>
              ) : (
                <>
                  <span className="text-amber-700 dark:text-amber-400 font-black">Connecting</span>
                </>
              )}
            </span>
          </div>

          <button
            id="manual-refresh-sync-btn"
            onClick={onManualRefresh}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl active:scale-95 text-xs font-black transition-all disabled:opacity-50 cursor-pointer shadow-sm ${
              isLight
                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-400'
                : 'bg-[#141d30] hover:bg-[#1a2640] text-slate-100 border border-white/[0.1]'
            }`}
            title="Fetch latest rankings from Supabase database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
