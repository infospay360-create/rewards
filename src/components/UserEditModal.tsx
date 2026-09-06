import React, { useState, useEffect } from 'react';
import { X, Save, User, Ticket, Check } from 'lucide-react';
import { LeaderboardUser } from '../types';
import { calculateTickets } from '../utils/leaderboardUtils';

interface UserEditModalProps {
  user: LeaderboardUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: LeaderboardUser) => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !user) return null;

  const [userIdInput, setUserIdInput] = useState(user.userId || '');
  const [name, setName] = useState(user.name || '');
  const [directCount, setDirectCount] = useState(user.directCount);
  const [ticketCount, setTicketCount] = useState(user.ticketCount);
  const [customBonus, setCustomBonus] = useState(user.customTicketBonus || 0);

  useEffect(() => {
    setUserIdInput(user.userId || '');
    setName(user.name || '');
    setDirectCount(user.directCount);
    setTicketCount(user.ticketCount);
    setCustomBonus(user.customTicketBonus || 0);
  }, [user]);

  // Handle direct changes
  const handleDirectChange = (val: number) => {
    const d = Math.max(0, val);
    setDirectCount(d);
    setTicketCount(Math.floor(d / 5) + customBonus);
  };

  // Handle explicit ticket changes
  const handleTicketChange = (val: number) => {
    const t = Math.max(0, val);
    setTicketCount(t);
    const earnedFromDirects = Math.floor(directCount / 5);
    setCustomBonus(Math.max(0, t - earnedFromDirects));
  };

  // Handle bonus changes
  const handleBonusChange = (val: number) => {
    const b = Math.max(0, val);
    setCustomBonus(b);
    setTicketCount(Math.floor(directCount / 5) + b);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = userIdInput.trim().toUpperCase() || user.userId;
    onSave({
      ...user,
      userId: cleanId,
      name: name.trim() || `Member ${cleanId.slice(-4)}`,
      directCount: Math.max(0, directCount),
      customTicketBonus: Math.max(0, customBonus),
      ticketCount: Math.max(0, ticketCount),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Edit Member: {user.userId}
              </h3>
              <p className="text-xs text-slate-400">
                Update User ID, member name & referrals
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              User ID
            </label>
            <input
              type="text"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              placeholder="e.g. SPAY411819"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Member Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          {/* Total Tickets Field */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Ticket className="w-4 h-4" />
                <span>Total Tickets (Ticket Count)</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleTicketChange(0)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition ${
                    ticketCount === 0
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  00
                </button>
                <button
                  type="button"
                  onClick={() => handleTicketChange(10)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition ${
                    ticketCount === 10
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  10
                </button>
                <button
                  type="button"
                  onClick={() => handleTicketChange(25)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition ${
                    ticketCount === 25
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  25
                </button>
              </div>
            </div>
            <input
              type="number"
              min="0"
              max="10000"
              value={ticketCount}
              onChange={(e) => handleTicketChange(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/50 rounded-xl text-base font-mono font-black text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
              placeholder="e.g. 10 or 25"
            />
            <p className="text-[11px] text-amber-400/80">
              Admin can set Tickets directly (e.g. 00 → 10 or 10 → 25)
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Total Direct Referrals
              </label>
              <span className="text-[11px] text-emerald-400 font-semibold">
                Every 5 = 1 Ticket
              </span>
            </div>
            <input
              type="number"
              min="0"
              max="10000"
              value={directCount}
              onChange={(e) => handleDirectChange(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Custom Bonus Tickets (Optional)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={customBonus}
              onChange={(e) => handleBonusChange(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-amber-400 transition"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Add extra bonus tickets given in special promotions.
            </p>
          </div>

          {/* Real-time calculated total */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Final Assigned Tickets:</span>
            <span className="font-mono font-black text-amber-400 text-sm">
              🎟️ {ticketCount < 10 ? `0${ticketCount}` : ticketCount} Tickets
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:brightness-110 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-orange-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
