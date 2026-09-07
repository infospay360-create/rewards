import { ThemeSettings, BackgroundPresetId } from '../types';

export const THEME_STORAGE_KEY = 'smartpay360_theme_settings_v1';
export const THEME_BROADCAST_CHANNEL = 'smartpay360_theme_broadcast_v1';

export const DEFAULT_THEME: ThemeSettings = {
  presetId: 'midnight_gold',
  name: 'Midnight Obsidian & Gold',
  bgBaseColor: '#07090e',
  glowColor1: 'rgba(245, 158, 11, 0.12)', // Top Amber Gold
  glowColor2: 'rgba(37, 99, 235, 0.06)', // Side Sapphire
  patternStyle: 'dots',
  glowIntensity: 'vibrant',
  updatedAt: new Date().toISOString(),
};

export interface ThemePresetOption {
  id: BackgroundPresetId;
  name: string;
  subtitle: string;
  badge: string;
  previewBg: string;
  previewAccent: string;
  config: ThemeSettings;
}

export const THEME_PRESETS: ThemePresetOption[] = [
  {
    id: 'midnight_gold',
    name: 'Midnight Obsidian',
    subtitle: 'Executive Gold & Sapphire Ambient',
    badge: 'Original Default',
    previewBg: '#07090e',
    previewAccent: '#f59e0b',
    config: {
      presetId: 'midnight_gold',
      name: 'Midnight Obsidian',
      bgBaseColor: '#07090e',
      glowColor1: 'rgba(245, 158, 11, 0.12)',
      glowColor2: 'rgba(37, 99, 235, 0.06)',
      patternStyle: 'dots',
      glowIntensity: 'vibrant',
    },
  },
  {
    id: 'royal_navy',
    name: 'Royal Navy Blue',
    subtitle: 'Deep Sapphire & Electric Cyan Glow',
    badge: 'Popular',
    previewBg: '#050c18',
    previewAccent: '#0ea5e9',
    config: {
      presetId: 'royal_navy',
      name: 'Royal Navy Blue',
      bgBaseColor: '#050c18',
      glowColor1: 'rgba(14, 165, 233, 0.15)',
      glowColor2: 'rgba(99, 102, 241, 0.10)',
      patternStyle: 'dots',
      glowIntensity: 'vibrant',
    },
  },
  {
    id: 'emerald_matrix',
    name: 'Emerald Jade Matrix',
    subtitle: 'Prestigious Forest Jade & Gold Dust',
    badge: 'Lucky Winner',
    previewBg: '#04120c',
    previewAccent: '#10b981',
    config: {
      presetId: 'emerald_matrix',
      name: 'Emerald Jade Matrix',
      bgBaseColor: '#04120c',
      glowColor1: 'rgba(16, 185, 129, 0.15)',
      glowColor2: 'rgba(234, 179, 8, 0.08)',
      patternStyle: 'grid',
      glowIntensity: 'vibrant',
    },
  },
  {
    id: 'titanium_onyx',
    name: 'Titanium Onyx Minimal',
    subtitle: 'Clean Monochromatic Titanium Graphite',
    badge: 'Modern Ultra',
    previewBg: '#0a0a0d',
    previewAccent: '#94a3b8',
    config: {
      presetId: 'titanium_onyx',
      name: 'Titanium Onyx Minimal',
      bgBaseColor: '#0a0a0d',
      glowColor1: 'rgba(255, 255, 255, 0.06)',
      glowColor2: 'rgba(245, 158, 11, 0.05)',
      patternStyle: 'mesh',
      glowIntensity: 'subtle',
    },
  },
  {
    id: 'burgundy_ruby',
    name: 'Burgundy Velvet Ruby',
    subtitle: 'Royal Deep Wine & Warm Copper Radiance',
    badge: 'Luxury',
    previewBg: '#12060c',
    previewAccent: '#f43f5e',
    config: {
      presetId: 'burgundy_ruby',
      name: 'Burgundy Velvet Ruby',
      bgBaseColor: '#12060c',
      glowColor1: 'rgba(244, 63, 94, 0.14)',
      glowColor2: 'rgba(245, 158, 11, 0.08)',
      patternStyle: 'dots',
      glowIntensity: 'vibrant',
    },
  },
  {
    id: 'cyber_violet',
    name: 'Cosmic Cyber Violet',
    subtitle: 'Deep Galactic Purple & Neon Amber',
    badge: 'Vibrant',
    previewBg: '#0c0618',
    previewAccent: '#a855f7',
    config: {
      presetId: 'cyber_violet',
      name: 'Cosmic Cyber Violet',
      bgBaseColor: '#0c0618',
      glowColor1: 'rgba(168, 85, 247, 0.15)',
      glowColor2: 'rgba(251, 146, 60, 0.09)',
      patternStyle: 'grid',
      glowIntensity: 'vibrant',
    },
  },
  {
    id: 'ocean_teal',
    name: 'Deep Ocean Teal',
    subtitle: 'Abyssal Marine Cyan & Oceanic Blue',
    badge: 'Cool Depth',
    previewBg: '#041118',
    previewAccent: '#14b8a6',
    config: {
      presetId: 'ocean_teal',
      name: 'Deep Ocean Teal',
      bgBaseColor: '#041118',
      glowColor1: 'rgba(20, 184, 166, 0.15)',
      glowColor2: 'rgba(59, 130, 246, 0.09)',
      patternStyle: 'dots',
      glowIntensity: 'vibrant',
    },
  },
  {
    id: 'stealth_dark',
    name: 'Pitch Black Stealth',
    subtitle: 'Zero Glow OLED Pure Black Aesthetic',
    badge: 'OLED Black',
    previewBg: '#030406',
    previewAccent: '#64748b',
    config: {
      presetId: 'stealth_dark',
      name: 'Pitch Black Stealth',
      bgBaseColor: '#030406',
      glowColor1: 'rgba(255, 255, 255, 0.02)',
      glowColor2: 'rgba(255, 255, 255, 0.02)',
      patternStyle: 'dots',
      glowIntensity: 'off',
    },
  },
];

// Helper to get stored theme
export function getStoredTheme(): ThemeSettings {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.bgBaseColor) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[Theme] Error reading theme from storage:', e);
  }
  return DEFAULT_THEME;
}

// Helper to save stored theme
export function saveStoredTheme(theme: ThemeSettings): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch (e) {
    console.warn('[Theme] Error saving theme to storage:', e);
  }
}

// BroadcastChannel for cross-tab sync
let themeChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    themeChannel = new BroadcastChannel(THEME_BROADCAST_CHANNEL);
  }
} catch (err) {
  console.warn('[Theme] BroadcastChannel not supported:', err);
}

export function broadcastThemeChange(theme: ThemeSettings): void {
  if (themeChannel) {
    try {
      themeChannel.postMessage({ type: 'THEME_CHANGED', theme });
    } catch (err) {
      console.warn('[Theme] Error posting theme broadcast:', err);
    }
  }
}

export function subscribeToThemeBroadcasts(
  callback: (theme: ThemeSettings) => void
): () => void {
  if (!themeChannel) return () => {};
  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type === 'THEME_CHANGED' && event.data.theme) {
      callback(event.data.theme);
    }
  };
  themeChannel.addEventListener('message', handler);
  return () => {
    if (themeChannel) {
      themeChannel.removeEventListener('message', handler);
    }
  };
}

// Server API sync helpers
export async function fetchThemeFromApi(): Promise<ThemeSettings | null> {
  try {
    const res = await fetch('/api/theme', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.theme && data.theme.bgBaseColor) {
      return data.theme;
    }
  } catch {
    // API not reachable or offline, fallback to localStorage
  }
  return null;
}

export async function saveThemeToApi(theme: ThemeSettings): Promise<boolean> {
  try {
    const res = await fetch('/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
