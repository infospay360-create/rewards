import React, { useState, useEffect, useMemo } from 'react';
import { UserCheck, Ticket, Sparkles, Check, ArrowUpRight, ArrowDownRight, Plus, Minus, Zap, Lock, ShieldCheck, Database } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LeaderboardUser } from '../types';
import { calculateTickets, calculateProgressToNextTicket } from '../utils/leaderboardUtils';

interface QuickUpgradeBarProps {
  isAdmin: boolean;
  onOpenLogin: () => void;
  onOpenSupabaseModal?: () => void;
  users: LeaderboardUser[];
  onUpgradeUser: (data: {
    userId: string;
    name?: string;
    directCount?: number;
    ticketCount?: number;
    isAdditive?: boolean;
  }) => {
    isNew: boolean;
    oldTickets: number;
    newTickets: number;
    newRank: number;
  };
}

export const QuickUpgradeBar: React.FC<QuickUpgradeBarProps> = ({
  isAdmin,
  onOpenLogin,
  onOpenSupabaseModal,
  users,
  onUpgradeUser,
}) => {
  const [userIdInput, setUserIdInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [directValue, setDirectValue] = useState<number>(1);
  const [unit, setUnit] = useState<'directs' | 'tickets'>('directs');
  const [mode, setMode] = useState<'add' | 'subtract' | 'set'>('add');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'ticket' | 'info' | 'minus';
  } | null>(null);

  // Auto-search existing user when typing user ID
  const existingUser = useMemo(() => {
    const trimmed = userIdInput.trim().toUpperCase();
    if (!trimmed) return null;
    return users.find((u) => u.userId.toUpperCase() === trimmed) || null;
  }, [userIdInput, users]);

  // Sync name input when an existing user is detected
  useEffect(() => {
    if (existingUser && !nameInput) {
      setNameInput(existingUser.name || '');
    }
  }, [existingUser]);

  // Calculate prospective new direct count and prospective tickets
  const currentDirects = existingUser ? existingUser.directCount : 0;
  const currentTickets = existingUser ? existingUser.ticketCount : 0;
  let prospectiveDirects = currentDirects;
  let prospectiveTickets = currentTickets;

  if (unit === 'tickets') {
    if (mode === 'add') {
      prospectiveTickets = currentTickets + (Number(directValue) || 0);
    } else if (mode === 'subtract') {
      prospectiveTickets = Math.max(0, currentTickets - (Number(directValue) || 0));
    } else {
      prospectiveTickets = Math.max(0, Number(directValue) || 0);
    }
    prospectiveDirects = currentDirects;
  } else {
    if (mode === 'add') {
      prospectiveDirects = currentDirects + (Number(directValue) || 0);
    } else if (mode === 'subtract') {
      prospectiveDirects = Math.max(0, currentDirects - (Number(directValue) || 0));
    } else {
      prospectiveDirects = Math.max(0, Number(directValue) || 0);
    }
    prospectiveTickets = calculateTickets(prospectiveDirects, existingUser?.customTicketBonus || 0);
  }

  const willGainTicket = prospectiveTickets > currentTickets;
  const willLoseTicket = prospectiveTickets < currentTickets;
  const { needed } = calculateProgressToNextTicket(prospectiveDirects);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onOpenLogin();
      return;
    }

    const cleanId = userIdInput.trim().toUpperCase();
    if (!cleanId) return;

    let result: { isNew: boolean; oldTickets: number; newTickets: number; newRank: number };

    if (unit === 'tickets') {
      const ticketsToApply =
        mode === 'subtract'
          ? -Math.abs(Number(directValue) || 0)
          : Math.abs(Number(directValue) || 0);

      result = onUpgradeUser({
        userId: cleanId,
        name: nameInput.trim() || undefined,
        ticketCount: mode === 'set' ? Math.max(0, Number(directValue) || 0) : ticketsToApply,
        isAdditive: mode !== 'set',
      });
    } else {
      const countToApply =
        mode === 'subtract'
          ? -Math.abs(Number(directValue) || 0)
          : Math.abs(Number(directValue) || 0);

      result = onUpgradeUser({
        userId: cleanId,
        name: nameInput.trim() || undefined,
        directCount: mode === 'set' ? Math.max(0, Number(directValue) || 0) : countToApply,
        isAdditive: mode !== 'set',
      });
    }

    // Fire celebratory confetti if tickets increased or new ticket unlocked
    if (result.newTickets > result.oldTickets) {
      confetti({
        particleCount: 85,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
      });
      setNotification({
        message: `🎉 🎟️ NEW TICKET UNLOCKED! ${cleanId} now has ${result.newTickets} Tickets & is Rank #${result.newRank}!`,
        type: 'ticket',
      });
    } else if (mode === 'subtract') {
      setNotification({
        message: `🔻 ${cleanId} updated: Reduced by ${directValue}. Current: ${result.newTickets} Tickets (Rank #${result.newRank})`,
        type: 'minus',
      });
    } else {
      setNotification({
        message: `✅ ${cleanId} updated to ${result.newTickets} Tickets (Rank #${result.newRank})!`,
        type: 'success',
      });
    }

    // Auto clear notification after 4.5s
    setTimeout(() => {
      setNotification(null);
    }, 4500);

    // If added or subtracted, reset direct value to 1 for quick subsequent operations
    if (mode === 'add' || mode === 'subtract') {
      setDirectValue(1);
    }
  };

  const handleSelectQuickId = (id: string) => {
    setUserIdInput(id);
    const target = users.find((u) => u.userId === id);
    if (target) {
      setNameInput(target.name || '');
    }
  };

  // If user is not admin, hide completely from public middle view
  if (!isAdmin) {
    return null;
  }

  // Admin View (Unlocked)
  return (
    <div
      id="quick-upgrade-section"
      className="relative rounded-2xl bg-gradient-to-br from-slate-800/95 via-slate-850 to-slate-900 border border-amber-500/50 p-4 sm:p-6 shadow-2xl mb-8 backdrop-blur-md"
    >
      {/* Header of the quick update widget */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>👑 Admin Management Panel</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE ADMIN
              </span>
              {onOpenSupabaseModal && (
                <button
                  type="button"
                  onClick={onOpenSupabaseModal}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold transition-all cursor-pointer"
                  title="Supabase Database & Realtime Status"
                >
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span>Supabase Live</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </button>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Add new member IDs or increase direct referrals — System automatically generates 1 ticket for every 5 directs!
            </p>
          </div>
        </div>

        {/* Mode & Unit switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Unit Toggle */}
          <div className="flex items-center p-1 bg-slate-900/90 rounded-xl border border-amber-500/30 text-xs gap-1">
            <button
              type="button"
              onClick={() => {
                setUnit('directs');
                setDirectValue(1);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                unit === 'directs'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Directs (5=1🎟️)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUnit('tickets');
                setDirectValue(10);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                unit === 'tickets'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Tickets (🎟️)</span>
            </button>
          </div>

          {/* Operation Mode */}
          <div className="flex items-center p-1 bg-slate-900/80 rounded-xl border border-slate-700/80 text-xs gap-1">
            <button
              type="button"
              onClick={() => setMode('add')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                mode === 'add'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add (+N)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('subtract')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                mode === 'subtract'
                  ? 'bg-rose-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Minus (-N)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('set')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                mode === 'set'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Set Total</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
          {/* User ID field */}
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>User ID (SPAY...)</span>
              {existingUser && (
                <span className="text-[10px] text-emerald-400 font-normal">
                  Found: {existingUser.directCount} Directs | {existingUser.ticketCount} Tickets
                </span>
              )}
            </label>
            <div className="relative">
              <input
                id="input-user-id"
                type="text"
                placeholder="e.g. SPAY411819 or New ID"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                required
                className="w-full pl-3.5 pr-8 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
              {existingUser && (
                <Check className="w-4 h-4 text-emerald-400 absolute right-3 top-3" />
              )}
            </div>
          </div>

          {/* User Name field (optional) */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              User Name (Optional)
            </label>
            <input
              id="input-user-name"
              type="text"
              placeholder="e.g. Rajesh Sharma"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
          </div>

          {/* Direct or Ticket count field + quick increment/decrement buttons */}
          <div className="sm:col-span-5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {unit === 'tickets'
                  ? mode === 'add'
                    ? 'Tickets to Add (+🎟️)'
                    : mode === 'subtract'
                    ? 'Tickets to Minus (-🎟️)'
                    : 'New Total Tickets (🎟️)'
                  : mode === 'add'
                  ? 'Directs to Add (+)'
                  : mode === 'subtract'
                  ? 'Directs to Minus (-)'
                  : 'New Total Directs'}
              </label>
              <div className="flex items-center gap-1 text-[11px]">
                {unit === 'tickets' ? (
                  mode === 'set' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setDirectValue(0)}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer font-bold font-mono"
                      >
                        00
                      </button>
                      <button
                        type="button"
                        onClick={() => setDirectValue(10)}
                        className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 cursor-pointer font-bold font-mono"
                      >
                        10 🎟️
                      </button>
                      <button
                        type="button"
                        onClick={() => setDirectValue(25)}
                        className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 cursor-pointer font-bold font-mono"
                      >
                        25 🎟️
                      </button>
                    </>
                  ) : mode === 'subtract' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setDirectValue(1)}
                        className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 cursor-pointer font-bold"
                      >
                        -1 🎟️
                      </button>
                      <button
                        type="button"
                        onClick={() => setDirectValue(5)}
                        className="px-1.5 py-0.5 rounded bg-rose-600/30 text-rose-200 border border-rose-500/40 hover:bg-rose-600/40 cursor-pointer font-bold"
                      >
                        -5 🎟️
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setDirectValue(1)}
                        className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 cursor-pointer font-bold"
                      >
                        +1 🎟️
                      </button>
                      <button
                        type="button"
                        onClick={() => setDirectValue(5)}
                        className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 cursor-pointer font-bold"
                      >
                        +5 🎟️
                      </button>
                      <button
                        type="button"
                        onClick={() => setDirectValue(10)}
                        className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 cursor-pointer font-bold"
                      >
                        +10 🎟️
                      </button>
                    </>
                  )
                ) : mode === 'set' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setDirectValue(0)}
                      className="px-1.5 py-0.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirectValue(50)}
                      className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 cursor-pointer font-bold"
                      title="50 Directs = 10 Tickets"
                    >
                      50 (10 🎟️)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirectValue(125)}
                      className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 cursor-pointer font-bold"
                      title="125 Directs = 25 Tickets"
                    >
                      125 (25 🎟️)
                    </button>
                  </>
                ) : mode === 'subtract' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setDirectValue(1)}
                      className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 cursor-pointer font-bold"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirectValue(2)}
                      className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 cursor-pointer font-bold"
                    >
                      -2
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirectValue(5)}
                      className="px-1.5 py-0.5 rounded bg-rose-600/30 text-rose-200 border border-rose-500/40 hover:bg-rose-600/40 cursor-pointer font-bold"
                    >
                      -5 (1 Ticket)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setDirectValue(1)}
                      className="px-1.5 py-0.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirectValue(2)}
                      className="px-1.5 py-0.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                    >
                      +2
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirectValue(5)}
                      className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 cursor-pointer font-bold"
                    >
                      +5 (1 Ticket)
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="input-direct-count"
                type="number"
                min="0"
                max="10000"
                value={directValue}
                onChange={(e) => setDirectValue(Math.max(0, parseInt(e.target.value, 10) || 0))}
                required
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
              <button
                id="btn-submit-upgrade"
                type="submit"
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg active:scale-95 transition cursor-pointer flex items-center gap-1.5 ${
                  mode === 'subtract'
                    ? 'bg-gradient-to-r from-rose-600 to-red-700 hover:brightness-110 text-white shadow-rose-900/40'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-orange-500/20'
                }`}
              >
                {mode === 'subtract' ? (
                  <>
                    <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                    <span>Minus (-{directValue} {unit === 'tickets' ? '🎟️' : ''})</span>
                  </>
                ) : mode === 'set' ? (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Set ({directValue} {unit === 'tickets' ? '🎟️' : 'Directs'})</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    <span>{existingUser ? 'Upgrade User' : 'Add New User'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Live Calculation & Preview strip */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/70 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400">System Auto-Calculation:</span>
            <span className="font-semibold text-white">
              👥 New Total Directs: <span className={`${mode === 'subtract' ? 'text-rose-400' : 'text-emerald-400'} font-mono font-bold`}>{prospectiveDirects}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-semibold text-white flex items-center gap-1">
              🎟️ Auto Tickets: <span className="text-amber-400 font-mono font-bold">{prospectiveTickets}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              Next Ticket in: <span className="text-indigo-300 font-bold">{needed} more direct(s)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {willGainTicket && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Qualifies for +{prospectiveTickets - currentTickets} New Ticket!</span>
              </div>
            )}
            {willLoseTicket && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold">
                <span>⚠️ Will decrease tickets ({currentTickets} ➜ {prospectiveTickets})</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick select buttons for existing leaders in contest */}
        <div className="flex items-center gap-2 pt-1 overflow-x-auto text-[11px] pb-1 scrollbar-thin">
          <span className="text-slate-400 whitespace-nowrap">Quick Pick ID:</span>
          {users.slice(0, 10).map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => handleSelectQuickId(u.userId)}
              className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 font-mono whitespace-nowrap transition cursor-pointer"
            >
              {u.userId} ({u.directCount})
            </button>
          ))}
        </div>
      </form>

      {/* Floating or inline notification banner */}
      {notification && (
        <div
          className={`mt-4 p-3 rounded-xl border text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 ${
            notification.type === 'ticket'
              ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
              : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
          }`}
        >
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
