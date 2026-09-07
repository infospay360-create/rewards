import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  LogOut,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Users,
  Search,
  Plus,
  Minus,
  Edit3,
  CheckCircle2,
  Database,
  RefreshCw,
  Share2,
  RotateCcw,
} from 'lucide-react';
import { LeaderboardUser } from '../types';
import {
  verifyAdminCredentials,
  getStoredCustomPassword,
  setAdminCustomPassword,
  getStoredCustomUsername,
  setAdminCustomUsername,
  getFailedAttempts,
  resetFailedAttempts,
} from '../utils/leaderboardUtils';
import { QuickUpgradeBar } from './QuickUpgradeBar';

interface AdminPortalProps {
  isAdmin: boolean;
  users: LeaderboardUser[];
  onLoginSuccess: () => void;
  onLogout: () => void;
  onNavigateToLeaderboard: () => void;
  onUpgradeUser: (data: {
    userId: string;
    name?: string;
    directCount?: number;
    ticketCount?: number;
    isAdditive?: boolean;
  }) => { isNew: boolean; oldTickets: number; newTickets: number; newRank: number };
  onQuickAddDirect: (userId: string, count: number) => void;
  onEditUser: (user: LeaderboardUser) => void;
  onOpenBroadcast: () => void;
  onOpenSupabaseModal: () => void;
  onManualRefresh: () => void;
  onResetData: () => void;
  isSyncing: boolean;
  showToast: (msg: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isAdmin,
  users,
  onLoginSuccess,
  onLogout,
  onNavigateToLeaderboard,
  onUpgradeUser,
  onQuickAddDirect,
  onEditUser,
  onOpenBroadcast,
  onOpenSupabaseModal,
  onManualRefresh,
  onResetData,
  isSyncing,
  showToast,
}) => {
  // Login State
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Security / Custom Password Settings State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [customUserSetting, setCustomUserSetting] = useState('');
  const [isPasswordSaved, setIsPasswordSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Search in Admin User List
  const [searchQuery, setSearchQuery] = useState('');

  // Rate-limiting check
  useEffect(() => {
    const checkLock = () => {
      const failed = getFailedAttempts();
      const diff = Math.max(0, Math.ceil((failed.lockedUntil - Date.now()) / 1000));
      setLockoutRemaining(diff);
    };

    checkLock();
    const interval = setInterval(checkLock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize custom user field if exists
  useEffect(() => {
    if (isAdmin) {
      const existingUser = getStoredCustomUsername();
      if (existingUser) {
        setCustomUserSetting(existingUser);
      }
    }
  }, [isAdmin]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) {
      setError(`Access temporarily locked for security. Please wait ${lockoutRemaining}s.`);
      return;
    }

    if (verifyAdminCredentials(username, pin)) {
      setError(null);
      onLoginSuccess();
      showToast('🛡️ Welcome Administrator! Personal session active.');
    } else {
      const failed = getFailedAttempts();
      if (failed.lockedUntil > Date.now()) {
        const remaining = Math.ceil((failed.lockedUntil - Date.now()) / 1000);
        setError(`Too many failed attempts! Gateway locked for ${remaining} seconds to prevent brute force.`);
      } else {
        const left = Math.max(1, 5 - failed.count);
        setError(`Invalid credentials. ${left} attempts remaining before temporary lockout.`);
      }
    }
  };

  const handleSaveCustomSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 5) {
      showToast('⚠️ Password must be at least 5 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('⚠️ Password and confirmation do not match.');
      return;
    }

    const passSuccess = setAdminCustomPassword(newPassword.trim());
    if (customUserSetting && customUserSetting.trim().length >= 3) {
      setAdminCustomUsername(customUserSetting.trim());
    }

    if (passSuccess) {
      setIsPasswordSaved(true);
      setNewPassword('');
      setConfirmPassword('');
      showToast('🔒 Personal Admin Password updated! Only your new key will now be accepted.');
      setTimeout(() => setIsPasswordSaved(false), 5000);
    }
  };

  const handleCopySecretUrl = () => {
    const url = `${window.location.origin}/spay-admin`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('📋 Private Admin URL copied to clipboard! Save or bookmark this link.');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Filtered users for admin management table
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.userId.toLowerCase().includes(q) ||
      (u.name && u.name.toLowerCase().includes(q))
    );
  });

  const hasCustomPass = Boolean(getStoredCustomPassword());

  // ---------------------------------------------------------------------------
  // VIEW 1: PRIVATE LOGIN GATEWAY (When NOT authenticated)
  // ---------------------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={onNavigateToLeaderboard}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Public Leaderboard</span>
            </button>
          </div>

          {/* Secure Card */}
          <div className="relative bg-slate-900/95 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
            {/* Ambient Security Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
                <ShieldCheck className="w-8 h-8 text-amber-400" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider mb-2">
                <Lock className="w-3 h-3" /> Private Admin Gateway
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                SMARTPAY360 Portal
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Dedicated secret URL for administrator access. Removed from public leaderboard to prevent unauthorized access.
              </p>
            </div>

            {/* Lockout Warning */}
            {lockoutRemaining > 0 && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-3 animate-pulse">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <span className="font-bold block">Access Temporarily Locked</span>
                  <span>Too many failed attempts. Cooldown: {lockoutRemaining}s remaining.</span>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && lockoutRemaining === 0 && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                  Admin ID / Email
                </label>
                <input
                  type="text"
                  required
                  disabled={lockoutRemaining > 0}
                  placeholder="spay360 or admin"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  className="w-full px-4 py-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                  Security Password / PIN
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={lockoutRemaining > 0}
                    placeholder="Enter admin password"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setError(null);
                    }}
                    className="w-full pl-4 pr-11 py-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition cursor-pointer p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-admin-portal-login-submit"
                  type="submit"
                  disabled={lockoutRemaining > 0}
                  className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4 text-slate-950" />
                  <span>Authenticate & Open Admin Portal</span>
                </button>
              </div>
            </form>

            {/* Privacy notice */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-500">
                🔒 Protected with brute-force rate-limiting and encrypted session tokens.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW 2: AUTHENTICATED ADMIN CONTROL CENTER
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner with Navigation & Status */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/40 p-4 sm:p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Admin Control Center
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                  Session Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Exclusive Personal Admin Portal for SMARTPAY360 Leaderboard & Directs
              </p>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={onNavigateToLeaderboard}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500/40 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>View Leaderboard</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Private Admin URL Box */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-400">Your Private Admin URL:</span>
            <code className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-mono text-xs font-bold border border-slate-800">
              /spay-admin
            </code>
          </div>

          <button
            type="button"
            onClick={handleCopySecretUrl}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Secret Admin Link'}</span>
          </button>
        </div>
      </div>

      {/* Fast User ID & Direct Upgrade System */}
      <QuickUpgradeBar
        isAdmin={isAdmin}
        onOpenLogin={() => {}}
        onOpenSupabaseModal={onOpenSupabaseModal}
        users={users}
        onUpgradeUser={onUpgradeUser}
      />

      {/* Grid: 1. Personal Password & Security Manager, 2. Fast Tools & Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Change Personal Admin Password (Anti-Hack Protection) */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Personal Admin Security</span>
                {hasCustomPass ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Custom Password Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Default Pass in Use
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Set your own secret password so no one else can log in or hack your portal
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveCustomSecurity} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Username (Optional / Personal Alias)
              </label>
              <input
                type="text"
                placeholder="e.g. spay360"
                value={customUserSetting}
                onChange={(e) => setCustomUserSetting(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Secret Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 5 chars"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {isPasswordSaved && (
              <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Password saved successfully! Your custom secret key is now active.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>Save Personal Password</span>
            </button>
          </form>
        </div>

        {/* Card 2: Cloud Sync & Broadcast Tools */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Database & Contest Tools</h3>
                <p className="text-xs text-slate-400">
                  Real-time database sync across all mobile devices & WhatsApp broadcast
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onOpenSupabaseModal}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-emerald-500/30 text-left transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-300">Supabase Sync</span>
                  <Database className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400">PostgreSQL cloud DB & real-time sync</p>
              </button>

              <button
                type="button"
                onClick={onOpenBroadcast}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/30 text-left transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-300">WhatsApp Broadcast</span>
                  <Share2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400">Copy live ranking report for groups</p>
              </button>

              <button
                type="button"
                onClick={onManualRefresh}
                disabled={isSyncing}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-left transition cursor-pointer group disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200">Force Data Sync</span>
                  <RefreshCw className={`w-4 h-4 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
                </div>
                <p className="text-[11px] text-slate-400">Sync latest values from cloud server</p>
              </button>

              <button
                type="button"
                onClick={onResetData}
                className="p-3 rounded-xl bg-slate-950 hover:bg-rose-950/30 border border-rose-900/40 text-left transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-rose-300">Reset Snapshot</span>
                  <RotateCcw className="w-4 h-4 text-rose-400 group-hover:rotate-180 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400">Reset to initial 26 members</p>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Total Leaders: {users.length}</span>
            <span>Total Tickets: {users.reduce((s, u) => s + u.ticketCount, 0)}</span>
          </div>
        </div>
      </div>

      {/* Quick User Directory & Quick +/- Directs */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">All Contestants ({users.length})</h3>
              <p className="text-xs text-slate-400">Instant +1 / -1 Direct adjustments & User details edit</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search User ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider bg-slate-950/60">
                <th className="py-2.5 px-3 w-14 text-center">Rank</th>
                <th className="py-2.5 px-3">User ID & Name</th>
                <th className="py-2.5 px-3 text-center">Directs</th>
                <th className="py-2.5 px-3 text-center">Tickets</th>
                <th className="py-2.5 px-3 text-right">Quick Adjustments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u, idx) => (
                <tr key={u.userId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                    #{idx + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-300">{u.userId}</span>
                      <span className="text-slate-300 truncate max-w-[150px]">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-white">
                    {u.directCount}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full font-black text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      🎟️ {u.ticketCount}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onQuickAddDirect(u.userId, -1)}
                        disabled={u.directCount <= 0}
                        className={`px-2 py-1 rounded-lg font-bold border transition flex items-center gap-0.5 text-[11px] ${
                          u.directCount <= 0
                            ? 'bg-slate-950/40 text-slate-600 border-slate-800 cursor-not-allowed'
                            : 'bg-rose-950/50 text-rose-300 border-rose-800/50 hover:bg-rose-900 cursor-pointer'
                        }`}
                        title="Minus 1 Direct"
                      >
                        <Minus className="w-3 h-3" />
                        <span>-1</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onQuickAddDirect(u.userId, 1)}
                        className="px-2 py-1 rounded-lg font-bold bg-emerald-950/50 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900 transition flex items-center gap-0.5 text-[11px] cursor-pointer"
                        title="Add 1 Direct"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+1</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditUser(u)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                        title="Edit User ID or Name"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
