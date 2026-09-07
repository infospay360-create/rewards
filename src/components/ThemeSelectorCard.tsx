import React, { useState } from 'react';
import {
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Grid,
  CircleDot,
  Eye,
  Sliders,
  SunMedium,
  CheckCircle2,
} from 'lucide-react';
import { ThemeSettings, BackgroundPresetId, PatternStyle, GlowIntensity } from '../types';
import {
  THEME_PRESETS,
  DEFAULT_THEME,
} from '../utils/themePresets';

interface ThemeSelectorCardProps {
  currentTheme: ThemeSettings;
  onThemeChange: (newTheme: ThemeSettings, syncToServer?: boolean) => void;
  showToast: (msg: string) => void;
}

export const ThemeSelectorCard: React.FC<ThemeSelectorCardProps> = ({
  currentTheme,
  onThemeChange,
  showToast,
}) => {
  const [customHex, setCustomHex] = useState(
    currentTheme.presetId === 'custom' ? currentTheme.bgBaseColor : '#080d1a'
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleSelectPreset = (presetId: BackgroundPresetId) => {
    const found = THEME_PRESETS.find((p) => p.id === presetId);
    if (found) {
      const updated: ThemeSettings = {
        ...found.config,
        updatedAt: new Date().toISOString(),
      };
      onThemeChange(updated, true);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
      showToast(`⚡ Broadcasted "${found.name}" to all devices across India!`);
    }
  };

  const handlePatternChange = (pattern: PatternStyle) => {
    const updated: ThemeSettings = {
      ...currentTheme,
      patternStyle: pattern,
      updatedAt: new Date().toISOString(),
    };
    onThemeChange(updated, true);
    showToast(`✨ Pattern "${pattern.toUpperCase()}" broadcasted to all devices!`);
  };

  const handleGlowIntensityChange = (intensity: GlowIntensity) => {
    const updated: ThemeSettings = {
      ...currentTheme,
      glowIntensity: intensity,
      updatedAt: new Date().toISOString(),
    };
    onThemeChange(updated, true);
    showToast(`💡 Glow "${intensity.toUpperCase()}" broadcasted to all devices!`);
  };

  const handleApplyCustomHex = (e: React.FormEvent) => {
    e.preventDefault();
    let cleanHex = customHex.trim();
    if (!cleanHex.startsWith('#')) {
      cleanHex = '#' + cleanHex;
    }
    const updated: ThemeSettings = {
      presetId: 'custom',
      name: `Custom Theme (${cleanHex})`,
      bgBaseColor: cleanHex,
      glowColor1: 'rgba(245, 158, 11, 0.12)',
      glowColor2: 'rgba(59, 130, 246, 0.08)',
      patternStyle: currentTheme.patternStyle || 'dots',
      glowIntensity: currentTheme.glowIntensity || 'vibrant',
      customHex: cleanHex,
      updatedAt: new Date().toISOString(),
    };
    onThemeChange(updated, true);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    showToast(`🎨 Custom color "${cleanHex}" broadcasted to all India devices!`);
  };

  const handleResetToDefault = () => {
    onThemeChange(DEFAULT_THEME, true);
    showToast('🔄 Reverted to Default Theme & broadcasted across all devices.');
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 shadow-sm">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-white">Background & Theme Customizer</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All India Live Sync
              </span>
              {isSaved && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-bounce">
                  <CheckCircle2 className="w-3 h-3 text-amber-400" /> Broadcasted!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Admin jo bhi colour ya design yahan select karenge, wo pure India me sabhi mobile screens aur devices par bina refresh kiye real-time update ho jayega.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetToDefault}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 transition cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Default</span>
        </button>
      </div>

      {/* Preset Swatches Grid */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
          Select Background Theme Preset:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {THEME_PRESETS.map((preset) => {
            const isSelected = currentTheme.presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`relative p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer group flex flex-col justify-between min-h-[90px] ${
                  isSelected
                    ? 'border-amber-400 bg-slate-950/90 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-950/80'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${preset.previewBg} 0%, #0d121d 100%)`,
                }}
              >
                {/* Top preview swatch */}
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: preset.previewAccent }}
                    />
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200 truncate">
                      {preset.badge}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Bottom title & description */}
                <div>
                  <div className="text-xs font-bold text-white tracking-wide">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">
                    {preset.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Fine-Tuning: Pattern & Glow & Custom Hex */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
        {/* Control 1: Pattern Style */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2.5">
            <Grid className="w-3.5 h-3.5 text-amber-400" />
            <span>Overlay Pattern Style</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {(['dots', 'grid', 'mesh', 'none'] as PatternStyle[]).map((pattern) => (
              <button
                key={pattern}
                type="button"
                onClick={() => handlePatternChange(pattern)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer text-center ${
                  currentTheme.patternStyle === pattern
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {pattern === 'dots'
                  ? '• Dots Matrix'
                  : pattern === 'grid'
                  ? '# Tech Grid'
                  : pattern === 'mesh'
                  ? '◈ Subtle Mesh'
                  : '— Clean Flat'}
              </button>
            ))}
          </div>
        </div>

        {/* Control 2: Ambient Glow Intensity */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2.5">
            <SunMedium className="w-3.5 h-3.5 text-amber-400" />
            <span>Ambient Glow Intensity</span>
          </div>
          <div className="flex items-center gap-1.5">
            {(['vibrant', 'subtle', 'off'] as GlowIntensity[]).map((intensity) => (
              <button
                key={intensity}
                type="button"
                onClick={() => handleGlowIntensityChange(intensity)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer text-center ${
                  currentTheme.glowIntensity === intensity
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {intensity === 'vibrant'
                  ? '✨ Vibrant'
                  : intensity === 'subtle'
                  ? '🌙 Subtle'
                  : '🚫 Off'}
              </button>
            ))}
          </div>
        </div>

        {/* Control 3: Custom Hex Color Picker */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Custom Background Hex</span>
          </div>
          <form onSubmit={handleApplyCustomHex} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="color"
                value={customHex.startsWith('#') && customHex.length === 7 ? customHex : '#07090e'}
                onChange={(e) => setCustomHex(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 absolute left-1 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                placeholder="#07090e"
                className="w-full pl-11 pr-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer shrink-0"
            >
              Apply
            </button>
          </form>
        </div>
      </div>

      {/* Live Preview Bar */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Eye className="w-4 h-4 text-amber-400" />
          <span>
            Active Theme: <strong className="text-white">{currentTheme.name}</strong> (Base:{' '}
            <code className="text-amber-300 font-mono">{currentTheme.bgBaseColor}</code>)
          </span>
        </div>

        {isSaved && (
          <div className="inline-flex items-center gap-1.5 text-emerald-400 font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Theme Saved & Broadcasted!</span>
          </div>
        )}
      </div>
    </div>
  );
};
