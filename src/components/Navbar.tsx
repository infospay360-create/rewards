import React from 'react';
import { Trophy, Flame, Share2, RotateCcw, Calendar, Ticket, PlusCircle, ShieldCheck, Lock, LogOut } from 'lucide-react';

interface NavbarProps {
  isAdmin: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenBroadcast: () => void;
  onResetData: () => void;
  onScrollToUpgrade: () => void;
  totalUsers: number;
  totalTickets: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdmin,
  onOpenLogin,
  onLogout,
  onOpenBroadcast,
  onResetData,
  onScrollToUpgrade,
  totalUsers,
  totalTickets,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 shadow-lg shadow-orange-500/20 text-white font-black text-xl">
              <Trophy className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>SMARTPAY360</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-sm uppercase tracking-wider animate-pulse">
                    <Flame className="w-3 h-3 fill-current" /> Live
                  </span>
                </h1>
                {isAdmin ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Admin Mode
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-wider">
                    Public View
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                TOP 10 CASH PRIZES • 👥 5 DIRECT = 🎟️ 1 TICKET • LIVE LEADERBOARD
              </p>
            </div>
          </div>

          {/* Center Badges (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-xs">
              <span className="text-amber-400 font-bold">💰 TOP 10 CASH:</span>
              <span className="font-extrabold text-white">₹10,750 Pool</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
              <Ticket className="w-3.5 h-3.5 text-emerald-400" />
              <span>5 Direct ➜ 1 Ticket</span>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin ? (
              <>
                <button
                  id="btn-quick-upgrade-nav"
                  type="button"
                  onClick={onScrollToUpgrade}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md shadow-orange-500/20 hover:brightness-110 transition active:scale-95 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin Upgrade</span>
                  <span className="sm:hidden">Upgrade</span>
                </button>

                <button
                  id="btn-admin-logout"
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 transition cursor-pointer"
                  title="Logout from Admin Panel"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <button
                id="btn-open-admin-login"
                type="button"
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 transition active:scale-95 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Login</span>
              </button>
            )}

            <button
              id="btn-whatsapp-export"
              type="button"
              onClick={onOpenBroadcast}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition cursor-pointer"
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

