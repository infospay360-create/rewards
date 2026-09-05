import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, User, Ticket, Check } from 'lucide-react';
import { LeaderboardUser } from '../types';
import { calculateTickets } from '../utils/leaderboardUtils';

interface UserEditModalProps {
  user: LeaderboardUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: LeaderboardUser) => void;
  onDelete: (userId: string) => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !user) return null;

  const [name, setName] = useState(user.name || '');
  const [directCount, setDirectCount] = useState(user.directCount);
  const [customBonus, setCustomBonus] = useState(user.customTicketBonus || 0);

  useEffect(() => {
    setName(user.name || '');
    setDirectCount(user.directCount);
    setCustomBonus(user.customTicketBonus || 0);
  }, [user]);

  const autoCalculatedTickets = calculateTickets(directCount, customBonus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...user,
      name: name.trim() || `Member ${user.userId.slice(-4)}`,
      directCount: Math.max(0, directCount),
      customTicketBonus: Math.max(0, customBonus),
      ticketCount: autoCalculatedTickets,
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
                Update direct referrals & member name
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
              User ID (Read-only)
            </label>
            <input
              type="text"
              value={user.userId}
              disabled
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm font-mono font-bold text-slate-400 cursor-not-allowed"
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
              onChange={(e) => setDirectCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
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
              onChange={(e) => setCustomBonus(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-amber-400 transition"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Add extra bonus tickets given in special promotions.
            </p>
          </div>

          {/* Real-time calculated total */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Resulting Tickets:</span>
            <span className="font-mono font-black text-amber-400 text-sm">
              🎟️ {autoCalculatedTickets < 10 ? `0${autoCalculatedTickets}` : autoCalculatedTickets} Tickets
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to remove ${user.userId}?`)) {
                  onDelete(user.userId);
                  onClose();
                }
              }}
              className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-950/60 border border-rose-900/40 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete User</span>
            </button>

            <div className="flex items-center gap-2">
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
          </div>
        </form>
      </div>
    </div>
  );
};
