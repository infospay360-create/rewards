import React from 'react';
import { Trophy, Flame, Share2, RotateCcw, Calendar, Ticket, PlusCircle, ShieldCheck, Lock, LogOut } from 'lucide-react';
import { SmartPayLogo } from './SmartPayLogo';

interface NavbarProps {
  isAdmin: boolean;
  currentView?: 'leaderboard' | 'admin';
  onNavigateToAdmin?: () => void;
  onNavigateToLeaderboard?: () => void;
  onLogout: () => void;
  onOpenBroadcast: () => void;
  onResetData: () => void;
  onScrollToUpgrade: () => void;
  onOpenCashRewards?: () => void;
  onOpenGiftsModal?: () => void;
  totalUsers: number;
  totalTickets: number;
  isLight?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdmin,
  currentView = 'leaderboard',
  onNavigateToAdmin,
  onNavigateToLeaderboard,
  onLogout,
  onOpenBroadcast,
  onResetData,
  onScrollToUpgrade,
  onOpenCashRewards,
  onOpenGiftsModal,
  totalUsers,
  totalTickets,
  isLight = true,
}) => {
  return (
    <header
      className={`sticky top-0 z-30 transition-colors duration-300 ${
        isLight
          ? 'bg-white/95 backdrop-blur-xl border-b border-emerald-500/20 shadow-[0_4px_24px_rgba(5,150,105,0.06)] text-slate-900'
          : 'bg-[#080d19]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.4)] text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand & Logo (Exact poster 3D hexagon logo) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateToLeaderboard}
              className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
            >
              <SmartPayLogo size="md" isLight={isLight} showSubtitle={true} />
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-red-500/15 to-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 shadow-sm uppercase tracking-wider">
                <Flame className="w-3 h-3 fill-orange-500 text-orange-500 animate-pulse" /> Live
              </span>
              {isAdmin && (
                <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Admin
                </span>
              )}
            </button>
          </div>

          {/* Center Badges & Buttons (Desktop) */}
          <div className="hidden lg:flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenCashRewards}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/[0.08] hover:bg-amber-500/[0.16] border border-amber-500/30 text-xs transition-all duration-200 cursor-pointer shadow-sm group"
            >
              <span className="text-amber-400 font-extrabold group-hover:scale-105 transition-transform">💰 TOP 10:</span>
              <span className="font-bold text-slate-200">Guaranteed Cash</span>
            </button>
            <button
              type="button"
              onClick={onOpenGiftsModal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-500/[0.08] hover:bg-purple-500/[0.16] border border-purple-500/30 text-xs text-purple-200 transition-all duration-200 cursor-pointer shadow-sm group"
            >
              <span className="text-pink-400 font-extrabold group-hover:scale-105 transition-transform">🎁 40 GIFTS:</span>
              <span className="font-bold text-slate-200">Lucky Draw List</span>
            </button>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin && (
              <>
                {currentView === 'admin' ? (
                  <button
                    type="button"
                    onClick={onNavigateToLeaderboard}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold bg-[#141c2e] hover:bg-[#1a253c] text-amber-300 border border-amber-500/30 shadow-md transition cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>View Leaderboard</span>
                  </button>
                ) : (
                  <button
                    id="btn-quick-upgrade-nav"
                    type="button"
                    onClick={onNavigateToAdmin || onScrollToUpgrade}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-black bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/20 hover:brightness-110 transition active:scale-95 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin Panel</span>
                    <span className="sm:hidden">Admin</span>
                  </button>
                )}

                <button
                  id="btn-admin-logout"
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 border border-rose-800/40 transition cursor-pointer"
                  title="Logout from Admin Panel"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            )}

            <button
              id="btn-whatsapp-export"
              type="button"
              onClick={onOpenBroadcast}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition cursor-pointer shadow-sm"
              title="Copy WhatsApp Bulletin text"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Share Update</span>
            </button>

            {isAdmin && (
              <button
                id="btn-reset-data"
                type="button"
                onClick={onResetData}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                title="Reset to default initial 26 members"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

