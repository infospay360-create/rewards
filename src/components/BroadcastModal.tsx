import React, { useState } from 'react';
import { Copy, Check, Share2, X, Trophy, Coins, Gift } from 'lucide-react';
import { LeaderboardUser } from '../types';
import {
  generateWhatsAppBroadcast,
  generateTop10CashBroadcast,
  generateLuckyDraw40Broadcast,
} from '../utils/leaderboardUtils';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: LeaderboardUser[];
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  users,
}) => {
  const [activeTab, setActiveTab] = useState<'luckydraw' | 'cash' | 'leaderboard'>('luckydraw');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentText =
    activeTab === 'luckydraw'
      ? generateLuckyDraw40Broadcast(users)
      : activeTab === 'cash'
      ? generateTop10CashBroadcast(users)
      : generateWhatsAppBroadcast(users);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-emerald-400 bg-white shrink-0 shadow-md flex items-center justify-center">
              <img src="/smartpay_logo.png" alt="SmartPay 360" className="w-full h-full object-contain p-0.5" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                WhatsApp & Telegram Broadcast Generator
              </h3>
              <p className="text-xs text-slate-400">
                Copy formatted announcement with live ranks, tickets & 40 Lucky Draw Rewards
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

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 px-5 pt-3 pb-1 border-b border-slate-800 bg-slate-950/20">
          <button
            type="button"
            onClick={() => setActiveTab('luckydraw')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'luckydraw'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-slate-950" />
            <span>🪔 40 LUCKY DRAW REWARDS</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cash')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cash'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>🔥 TOP 10 CASH FORMAT</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>📊 FULL LEADERBOARD</span>
          </button>
        </div>

        {/* Text Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 font-mono text-xs sm:text-sm text-slate-300 bg-slate-950/70 select-all whitespace-pre-wrap rounded-xl m-4 border border-slate-800/80 leading-relaxed scrollbar-thin">
          {currentText}
        </div>

        {/* Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between bg-slate-950/40">
          <span className="text-xs text-slate-400">
            {activeTab === 'cash' ? 'Top 10 Cash distribution format' : `All ${users.length} contestants with tickets`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Close
            </button>
            <button
              id="btn-copy-broadcast"
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy WhatsApp Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
