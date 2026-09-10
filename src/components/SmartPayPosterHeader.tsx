import React from 'react';
import {
  Smartphone,
  ShoppingCart,
  FileText,
  LayoutGrid,
  TrendingUp,
  Crown,
  Sparkles,
} from 'lucide-react';
import { ThemeSettings } from '../types';
import { SmartPayLogo } from './SmartPayLogo';

interface SmartPayPosterHeaderProps {
  currentTheme: ThemeSettings;
}

export const SmartPayPosterHeader: React.FC<SmartPayPosterHeaderProps> = ({ currentTheme }) => {
  const isLight = currentTheme.isLight !== false;

  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl transition-all duration-500 shadow-xl border border-emerald-500/20 bg-gradient-to-b from-white/90 via-[#f0fdf4]/80 to-white/90 backdrop-blur-xl p-4 sm:p-6 text-slate-900">
      {/* Decorative Emerald & Gold Radiance Aura */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-300/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-gradient-to-tr from-amber-400/15 to-yellow-300/10 blur-3xl pointer-events-none" />

      {/* Top Banner Row */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4 pb-4 border-b border-emerald-500/15">
        {/* Left: SmartPay 360 Official 3D Isometric Logo & Motto */}
        <SmartPayLogo size="lg" isLight={isLight} showSubtitle={true} />

        {/* Center: "Together We Grow" Script Calligraphy */}
        <div className="text-center px-4">
          <div className="inline-flex items-center gap-2">
            <span
              className="text-2xl sm:text-3xl md:text-4xl text-[#047857] font-black tracking-wide"
              style={{ fontFamily: "'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive, serif" }}
            >
              Together We Grow
            </span>
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
        </div>

        {/* Right: "Bigger Network Bigger Rewards" & Services Quick Pills */}
        <div className="flex flex-col items-center lg:items-end gap-2.5">
          {/* Bigger Network Bigger Rewards Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-[11px] font-black tracking-tight">Bigger Network</span>
              <span className="block text-[9px] font-bold text-emerald-100 uppercase tracking-wider">Bigger Rewards</span>
            </div>
          </div>

          {/* 5 Quick Action Service Tiles */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex flex-col items-center p-1.5 px-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-950 hover:bg-sky-500/25 transition-all cursor-default shadow-xs">
              <Smartphone className="w-4 h-4 text-[#0284c7]" />
              <span className="text-[9px] font-black text-slate-950 mt-0.5">Recharge</span>
            </div>
            <div className="flex flex-col items-center p-1.5 px-2.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-950 hover:bg-orange-500/25 transition-all cursor-default shadow-xs">
              <ShoppingCart className="w-4 h-4 text-[#ea580c]" />
              <span className="text-[9px] font-black text-slate-950 mt-0.5">Shopping</span>
            </div>
            <div className="flex flex-col items-center p-1.5 px-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-950 hover:bg-amber-500/25 transition-all cursor-default shadow-xs">
              <FileText className="w-4 h-4 text-[#d97706]" />
              <span className="text-[9px] font-black text-slate-950 mt-0.5 whitespace-nowrap">Bill Payment</span>
            </div>
            <div className="flex flex-col items-center p-1.5 px-2.5 rounded-xl bg-slate-500/15 border border-slate-500/30 text-slate-950 hover:bg-slate-500/25 transition-all cursor-default shadow-xs">
              <LayoutGrid className="w-4 h-4 text-slate-900" />
              <span className="text-[9px] font-black text-slate-950 mt-0.5">More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Header Ribbon Row: "Rank #1 to #3 Cash Position" Badge */}
      <div className="relative z-10 pt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#047857] text-white text-xs font-black shadow-md shadow-emerald-700/20">
            <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Rank #1 to #3 Cash Position</span>
          </span>
          <span className="text-xs font-black text-emerald-950 hidden sm:inline-block">
            Win More • Inspire More • 5 Directs = 1 Lucky Ticket
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-black">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-400">
            💰 Top 10 Cash Guaranteed
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-950 border border-emerald-400">
            🎁 40 Lucky Draw Gifts
          </span>
        </div>
      </div>
    </div>
  );
};
