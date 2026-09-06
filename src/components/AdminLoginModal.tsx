import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle, X, UserCheck } from 'lucide-react';
import { verifyAdminCredentials, DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PIN } from '../utils/leaderboardUtils';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminCredentials(username, pin)) {
      setError(null);
      onLoginSuccess();
      onClose();
    } else {
      setError('Invalid Admin ID or PIN. Please check credentials.');
    }
  };

  const handleFillDemoCredentials = () => {
    setUsername(DEFAULT_ADMIN_USERNAME);
    setPin(DEFAULT_ADMIN_PIN);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>SMARTPAY360 Admin Login</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  SECURE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Log in to update Directs, Tickets, and manage Leaderboard
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Username / Email
            </label>
            <input
              type="text"
              required
              placeholder="e.g. admin or spay360"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Security PIN / Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(null);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
          </div>

          {/* Quick Default Credentials Pill */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="text-slate-400">
              <span>Default Login: </span>
              <span className="font-mono text-amber-300 font-bold">admin</span>
              <span className="text-slate-500"> / </span>
              <span className="font-mono text-amber-300 font-bold">admin</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              Auto-fill
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="btn-admin-login-submit"
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:brightness-110 shadow-lg shadow-orange-500/20 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>Login as Admin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
