import React from 'react';
import { Users, Gift, Rocket, Sparkles } from 'lucide-react';
import { ThemeSettings } from '../types';
import { SmartPayLogo } from './SmartPayLogo';

interface SmartPayPosterFooterProps {
  currentTheme: ThemeSettings;
}

export const SmartPayPosterFooter: React.FC<SmartPayPosterFooterProps> = ({ currentTheme }) => {
  return (
    <div className="relative mt-12 overflow-hidden rounded-3xl shadow-2xl border border-emerald-500/30 bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#022c22] p-6 sm:p-8 text-white">
      {/* Golden Wave Accents */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="w-full h-full">
          <path
            d="M0,80 C300,160 600,0 900,100 C1050,150 1150,50 1200,80 L1200,200 L0,200 Z"
            fill="url(#goldGradient)"
          />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Calligraphy Script */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-amber-300 animate-bounce" />
            <span
              className="text-2xl sm:text-3xl lg:text-4xl text-amber-200 font-bold tracking-wide"
              style={{ fontFamily: "'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive, serif" }}
            >
              Earn Today A Better Tomorrow
            </span>
          </div>
          <p className="text-xs text-emerald-100 font-medium mt-1">
            Build your team, unlock unlimited lucky draw tickets, and win guaranteed top cash rewards!
          </p>
        </div>

        {/* Center: 3 Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
          {/* Badge 1: More Directs More Income */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-400 text-emerald-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-black text-white">More Directs</span>
              <span className="block text-[10px] font-bold text-emerald-200 uppercase tracking-wider">More Income</span>
            </div>
          </div>

          {/* Badge 2: More Tickets Bigger Rewards */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Gift className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-black text-white">More Tickets</span>
              <span className="block text-[10px] font-bold text-amber-200 uppercase tracking-wider">Bigger Rewards</span>
            </div>
          </div>

          {/* Badge 3: Same Team Bigger Dreams */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-teal-400 text-teal-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Rocket className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-black text-white">Same Team</span>
              <span className="block text-[10px] font-bold text-teal-200 uppercase tracking-wider">Bigger Dreams</span>
            </div>
          </div>
        </div>

        {/* Right: SmartPay 360 Official Brand Watermark */}
        <div className="hidden lg:flex flex-col items-end shrink-0 pl-4 border-l border-white/20">
          <SmartPayLogo size="md" isLight={false} showSubtitle={true} />
        </div>
      </div>
    </div>
  );
};
