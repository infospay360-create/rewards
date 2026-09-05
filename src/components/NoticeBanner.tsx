import React from 'react';
import { AlertCircle, Target, Calendar, Sparkles, Rocket, Heart } from 'lucide-react';

export const NoticeBanner: React.FC = () => {
  return (
    <div className="space-y-4 mb-10">
      {/* Rules Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-900 border border-amber-500/30 p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Reward Program
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/30 text-red-300 border border-red-500/40">
                  LIVE CONTEST
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                🎯 LUCKY DRAW RULES: 👥 EVERY 5 DIRECT ➜ 🎟️ 1 TICKET
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Jitne bhi bar 5 direct hoga, har 5 direct me 1 ticket milega! <strong>1st 5 direct me Free T-Shirt!</strong> Jis k pas jada tickets honge, wo Lucky Draw me 40 Mega Prizes (10 Real Gifts + 30 E-Wallets) win kar sakta hai!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 shrink-0">
            <Calendar className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Contest Dates</span>
              <span className="text-xs sm:text-sm font-bold text-amber-300">1 Sep to 31 Oct</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notice & Motivation Card */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Official Disclaimer in Hindi & English as provided in prompt */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>⚠️ IMPORTANT NOTICE</span>
            </div>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-sky-400">🔹</span>
                <span>यह केवल <strong>CURRENT PERFORMANCE UPDATE</strong> है।</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sky-400">🔹</span>
                <span>यह <strong>FINAL WINNER LIST</strong> नहीं है।</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sky-400">🔹</span>
                <span>Performance के अनुसार ranking live बदलती रहेगी।</span>
              </li>
            </ul>
          </div>

          {/* Motivational Call to Action */}
          <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-800 text-center space-y-2">
            <div className="text-xs sm:text-sm font-black text-white flex items-center justify-center gap-2">
              <Rocket className="w-4 h-4 text-amber-400" />
              <span>🚀 DIRECT बढ़ाइए • TICKETS बढ़ाइए • 🏆 LEADERBOARD में TOP पर आइए!</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1 text-rose-400">
                <Heart className="w-3.5 h-3.5 fill-current" /> SMARTPAY360
              </span>
              <span>•</span>
              <span className="text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> KEEP ACHIEVING • KEEP GROWING
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
