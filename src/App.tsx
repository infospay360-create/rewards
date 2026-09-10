import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, ShieldCheck } from 'lucide-react';
import { LeaderboardUser, ThemeSettings } from './types';
import { INITIAL_LEADERBOARD_USERS } from './data/initialData';
import {
  loadUsersFromStorage,
  saveUsersToStorage,
  sortLeaderboard,
  calculateTickets,
  checkAdminSession,
  saveAdminSession,
  fetchUsersFromApi,
  fetchVersionFromApi,
  fetchVersionInfoFromApi,
  syncUsersToApi,
  upgradeUserOnApi,
  editUserOnApi,
  resetUsersOnApi,
  broadcastToOtherTabs,
  subscribeToTabBroadcasts,
} from './utils/leaderboardUtils';
import {
  getStoredTheme,
  saveStoredTheme,
  fetchThemeFromApi,
  saveThemeToApi,
  broadcastThemeChange,
  subscribeToThemeBroadcasts,
  THEME_STORAGE_KEY,
} from './utils/themePresets';
import { Navbar } from './components/Navbar';
import { TopActionsBar } from './components/TopActionsBar';
import { RewardsModal } from './components/RewardsModal';
import { CheckRankCard } from './components/CheckRankCard';
import { StatsCards } from './components/StatsCards';
import { QuickUpgradeBar } from './components/QuickUpgradeBar';
import { LeaderboardPodium } from './components/LeaderboardPodium';
import { LeaderboardTable } from './components/LeaderboardTable';
import { NoticeBanner } from './components/NoticeBanner';
import { BroadcastModal } from './components/BroadcastModal';
import { UserEditModal } from './components/UserEditModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPortal } from './components/AdminPortal';
import { SupabaseSyncModal } from './components/SupabaseSyncModal';
import { SmartPayPosterHeader } from './components/SmartPayPosterHeader';
import { SmartPayPosterFooter } from './components/SmartPayPosterFooter';
import {
  fetchUsersFromSupabase,
  upsertUserInSupabase,
  seedOrResetSupabaseUsers,
  deleteUserFromSupabase,
  subscribeToSupabaseRealtime,
  subscribeToSupabaseTheme,
  broadcastThemeToSupabase,
} from './lib/supabase';

// Helper to check if current URL is for Admin Portal (/spay-admin, /admin, etc.)
const checkIsAdminRoute = (): boolean => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path.includes('/spay-admin') ||
    path.includes('/admin') ||
    hash.includes('spay-admin') ||
    hash.includes('admin') ||
    search.includes('portal=admin') ||
    search.includes('admin=true') ||
    search.includes('admin=login')
  );
};

export default function App() {
  const [users, setUsers] = useState<LeaderboardUser[]>(() => {
    return sortLeaderboard(loadUsersFromStorage());
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return checkAdminSession();
  });

  // Dedicated View Routing ('leaderboard' vs 'admin')
  const [currentView, setCurrentView] = useState<'leaderboard' | 'admin'>(() => {
    return checkIsAdminRoute() ? 'admin' : 'leaderboard';
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<LeaderboardUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  const currentVersionRef = useRef<number>(0);
  const currentThemeVersionRef = useRef<number>(0);

  // Background theme state
  const [currentTheme, setCurrentTheme] = useState<ThemeSettings>(getStoredTheme);

  const handleThemeChange = useCallback(
    async (newTheme: ThemeSettings, syncToServer = true) => {
      setCurrentTheme(newTheme);
      saveStoredTheme(newTheme);
      broadcastThemeChange(newTheme);
      broadcastThemeToSupabase(newTheme);
      if (syncToServer) {
        saveThemeToApi(newTheme).catch((err) => {
          console.warn('[Theme] Sync error:', err);
        });
      }
    },
    []
  );

  // Sync route changes (browser back/forward & hash changes)
  useEffect(() => {
    const handleLocationChange = () => {
      if (checkIsAdminRoute()) {
        setCurrentView('admin');
      } else {
        setCurrentView('leaderboard');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToAdmin = useCallback(() => {
    try {
      window.history.pushState({}, '', '/spay-admin');
    } catch {}
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToLeaderboard = useCallback(() => {
    try {
      window.history.pushState({}, '', '/');
    } catch {}
    setCurrentView('leaderboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Rewards Modal state (Top 10 Cash vs 40 Lucky Draw Gifts)
  const [rewardsModalState, setRewardsModalState] = useState<{
    isOpen: boolean;
    initialTab: 'cash' | 'gifts';
  }>({
    isOpen: false,
    initialTab: 'cash',
  });

  // Show transient toast notification
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Save to localStorage as backup cache
  useEffect(() => {
    saveUsersToStorage(users);
  }, [users]);

  // Real-time synchronization engine across all mobile devices, browsers & tabs:
  // 1. Initial direct load from central server (guarantees latest data on load across any browser)
  // 2. BroadcastChannel for 0ms cross-tab updates within same browser
  // 3. Storage event listener for cross-tab persistence
  // 4. Server-Sent Events (SSE) push stream for instant live updates across devices
  // 5. 1.5-second lightweight version probe for 100% reliability on mobile cellular networks
  // 6. Window focus and visibility listener for instant refresh when returning to tab
  useEffect(() => {
    let isMounted = true;
    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const applyUsersUpdate = (serverUsers: LeaderboardUser[], version?: number) => {
      if (!isMounted || !Array.isArray(serverUsers) || serverUsers.length === 0) return;
      if (version && version > 0) {
        currentVersionRef.current = version;
      }
      const sorted = sortLeaderboard(serverUsers);
      setUsers(sorted);
      saveUsersToStorage(sorted);
      setIsLiveConnected(true);
    };

    const fetchFullData = async (silent = true) => {
      if (!silent) setIsSyncing(true);

      // Priority 1: Direct query to Supabase PostgreSQL database (Absolute Source of Truth)
      try {
        const supabaseUsers = await fetchUsersFromSupabase();
        if (isMounted && supabaseUsers && supabaseUsers.length > 0) {
          applyUsersUpdate(supabaseUsers);
          setIsSupabaseLive(true);
          if (!silent && isMounted) setIsSyncing(false);
          return;
        }
      } catch (err) {
        console.warn('[Supabase Direct] Fetch note:', err);
      }

      // Priority 2: Central server API fallback
      const res = await fetchUsersFromApi();
      if (isMounted && res && res.users) {
        applyUsersUpdate(res.users, res.version);
      }
      if (!silent && isMounted) setIsSyncing(false);
    };

    // Immediate initial fetch
    fetchFullData(false);

    // Priority A: Supabase Realtime (postgres_changes broadcast instantly to all mobiles & browsers)
    const unsubscribeSupabase = subscribeToSupabaseRealtime((freshUsers) => {
      if (isMounted && freshUsers && freshUsers.length > 0) {
        applyUsersUpdate(freshUsers);
        setIsSupabaseLive(true);
      }
    });

    // Priority B: Listen for instant tab-to-tab BroadcastChannel broadcasts
    const unsubscribeTabs = subscribeToTabBroadcasts((tabUsers) => {
      if (isMounted) {
        applyUsersUpdate(tabUsers);
      }
    });

    // Listen for cross-tab theme broadcasts
    const unsubscribeTheme = subscribeToThemeBroadcasts((newTheme) => {
      if (isMounted && newTheme && newTheme.bgBaseColor) {
        setCurrentTheme(newTheme);
      }
    });

    // Listen for Supabase Realtime theme broadcasts (All India Multi-Device Live Sync)
    const unsubscribeSupabaseTheme = subscribeToSupabaseTheme((newTheme) => {
      if (isMounted && newTheme && newTheme.bgBaseColor) {
        setCurrentTheme(newTheme);
        saveStoredTheme(newTheme);
      }
    });

    // Fetch theme from central server
    fetchThemeFromApi().then((serverTheme) => {
      if (isMounted && serverTheme && serverTheme.bgBaseColor) {
        setCurrentTheme(serverTheme);
        saveStoredTheme(serverTheme);
      }
    });

    // Priority C: Cross-tab localStorage storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'smartpay360_leaderboard_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            applyUsersUpdate(parsed);
          }
        } catch {
          // ignore parsing error
        }
      }
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        try {
          const parsedTheme = JSON.parse(e.newValue);
          if (parsedTheme && parsedTheme.bgBaseColor) {
            setCurrentTheme(parsedTheme);
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Priority D: Server-Sent Events (SSE) stream for live push
    const setupSSE = () => {
      try {
        eventSource = new EventSource('/api/stream');

        eventSource.onopen = () => {
          if (isMounted) setIsLiveConnected(true);
        };

        eventSource.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data && Array.isArray(data.users) && data.users.length > 0) {
              applyUsersUpdate(data.users, data.version);
            }
            if (data && data.theme && data.theme.bgBaseColor) {
              setCurrentTheme(data.theme);
              saveStoredTheme(data.theme);
            }
          } catch (e) {
            console.error('[SSE] Parse error:', e);
          }
        };

        eventSource.onerror = () => {
          if (isMounted) setIsLiveConnected(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (isMounted && !reconnectTimer) {
            reconnectTimer = setTimeout(() => {
              reconnectTimer = null;
              if (isMounted) setupSSE();
            }, 3000);
          }
        };
      } catch (err) {
        console.warn('[SSE] EventSource init error:', err);
      }
    };

    setupSSE();

    // Priority E: Ultra-fast 1.5-second lightweight version probe (ensures all devices across India stay synchronized)
    const pollInterval = setInterval(async () => {
      const info = await fetchVersionInfoFromApi();
      if (!isMounted) return;
      if (info) {
        setIsLiveConnected(true);
        if (typeof info.version === 'number' && info.version > currentVersionRef.current) {
          await fetchFullData(true);
        }
        if (info.theme && info.theme.bgBaseColor) {
          const incomingThemeVer = Number(info.themeVersion || 0);
          if (incomingThemeVer > currentThemeVersionRef.current) {
            currentThemeVersionRef.current = incomingThemeVer;
            setCurrentTheme(info.theme);
            saveStoredTheme(info.theme);
          }
        }
      }
    }, 1500);

    // Priority F: Tab focus or screen unlock sync
    const handleVisibilityOrFocus = () => {
      fetchFullData(true);
      fetchThemeFromApi().then((serverTheme) => {
        if (isMounted && serverTheme && serverTheme.bgBaseColor) {
          setCurrentTheme(serverTheme);
          saveStoredTheme(serverTheme);
        }
      });
    };
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      isMounted = false;
      unsubscribeSupabase();
      unsubscribeSupabaseTheme();
      unsubscribeTabs();
      unsubscribeTheme();
      window.removeEventListener('storage', handleStorageChange);
      if (eventSource) eventSource.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, []);

  // Manual refresh trigger
  const handleManualRefresh = useCallback(async () => {
    setIsSyncing(true);

    // Also refresh theme from server
    fetchThemeFromApi().then((serverTheme) => {
      if (serverTheme && serverTheme.bgBaseColor) {
        setCurrentTheme(serverTheme);
        saveStoredTheme(serverTheme);
      }
    });

    // First attempt direct Supabase query
    const supabaseUsers = await fetchUsersFromSupabase();
    if (supabaseUsers && supabaseUsers.length > 0) {
      const sorted = sortLeaderboard(supabaseUsers);
      setUsers(sorted);
      saveUsersToStorage(sorted);
      broadcastToOtherTabs(sorted);
      setIsSupabaseLive(true);
      showToast('🔄 Synced live contest data directly from Supabase PostgreSQL!');
      setIsSyncing(false);
      return;
    }

    const fresh = await fetchUsersFromApi();
    if (fresh && fresh.users && fresh.users.length > 0) {
      currentVersionRef.current = fresh.version;
      const sorted = sortLeaderboard(fresh.users);
      setUsers(sorted);
      saveUsersToStorage(sorted);
      broadcastToOtherTabs(sorted, fresh.version);
      showToast('🔄 Synced live contest data from cloud server.');
    } else {
      showToast('⚡ Leaderboard is up to date.');
    }
    setIsSyncing(false);
  }, [showToast]);

  const handleAdminLoginSuccess = useCallback(() => {
    setIsAdmin(true);
    saveAdminSession(true);
    showToast('👑 Admin Logged In! You can now add user IDs, names, and update directs.');
  }, [showToast]);

  const handleAdminLogout = useCallback(() => {
    setIsAdmin(false);
    saveAdminSession(false);
    showToast('Logged out of Admin mode. Viewing public leaderboard.');
  }, [showToast]);

  // Primary upgrade function (synchronously returns calculated results to UI and broadcasts to all clients)
  const handleUpgradeUser = useCallback(
    (data: { userId: string; name?: string; directCount?: number; ticketCount?: number; isAdditive?: boolean }) => {
      const cleanId = data.userId.trim().toUpperCase();
      let isNew = false;
      let oldTickets = 0;
      let newTickets = 0;

      const existingIndex = users.findIndex((u) => u.userId.toUpperCase() === cleanId);
      let updatedList: LeaderboardUser[];

      if (existingIndex >= 0) {
        const current = users[existingIndex];
        oldTickets = current.ticketCount;

        let newDirect = current.directCount;
        if (data.directCount !== undefined) {
          newDirect = Math.max(0, data.isAdditive ? current.directCount + data.directCount : data.directCount);
        }

        let customBonus = current.customTicketBonus || 0;
        if (data.ticketCount !== undefined) {
          newTickets = Math.max(0, data.isAdditive ? current.ticketCount + data.ticketCount : data.ticketCount);
          customBonus = Math.max(0, newTickets - Math.floor(newDirect / 5));
        } else {
          newTickets = calculateTickets(newDirect, customBonus);
        }

        const updatedUser: LeaderboardUser = {
          ...current,
          name: data.name && data.name.trim() ? data.name.trim() : current.name,
          directCount: newDirect,
          customTicketBonus: customBonus,
          ticketCount: newTickets,
          updatedAt: new Date().toISOString(),
        };

        updatedList = [...users];
        updatedList[existingIndex] = updatedUser;
      } else {
        isNew = true;
        oldTickets = 0;
        const directs = Math.max(0, data.directCount || 0);
        let tickets = 0;
        let customBonus = 0;
        if (data.ticketCount !== undefined) {
          tickets = Math.max(0, data.ticketCount);
          customBonus = Math.max(0, tickets - Math.floor(directs / 5));
        } else {
          tickets = calculateTickets(directs, 0);
        }

        const newUser: LeaderboardUser = {
          id: `user-${Date.now()}`,
          userId: cleanId,
          name: data.name && data.name.trim() ? data.name.trim() : `Leader ${cleanId.slice(-4)}`,
          directCount: directs,
          customTicketBonus: customBonus,
          ticketCount: tickets,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        updatedList = [newUser, ...users];
      }

      // Automatically sort
      const sorted = sortLeaderboard(updatedList);
      setUsers(sorted);
      saveUsersToStorage(sorted);
      broadcastToOtherTabs(sorted);

      const newRank = sorted.findIndex((u) => u.userId.toUpperCase() === cleanId) + 1;

      // Sync directly with Supabase PostgreSQL (Source of Truth)
      const targetUser = updatedList.find((u) => u.userId.toUpperCase() === cleanId);
      if (targetUser) {
        upsertUserInSupabase(targetUser).catch((err) => {
          console.warn('[Supabase] Client upsert error:', err);
        });
      }

      // Sync with cloud server so all browsers & mobile devices see it
      upgradeUserOnApi(data).then((res) => {
        if (res && res.users) {
          setUsers(res.users);
          saveUsersToStorage(res.users);
          broadcastToOtherTabs(res.users);
        }
      });

      return { isNew, oldTickets, newTickets, newRank };
    },
    [users]
  );

  // Quick increment direct by +1 or +5 directly from table/podium
  const handleQuickAddDirect = useCallback(
    (userId: string, count = 1) => {
      if (!isAdmin) {
        setIsLoginModalOpen(true);
        return;
      }

      const target = users.find((u) => u.userId === userId);
      if (!target) return;

      const oldTickets = target.ticketCount;
      const newDirect = Math.max(0, target.directCount + count);
      const newTickets = calculateTickets(newDirect, target.customTicketBonus || 0);

      const updatedList = users.map((u) => {
        if (u.userId === userId) {
          return {
            ...u,
            directCount: newDirect,
            ticketCount: newTickets,
            updatedAt: new Date().toISOString(),
          };
        }
        return u;
      });

      const sorted = sortLeaderboard(updatedList);
      setUsers(sorted);
      saveUsersToStorage(sorted);
      broadcastToOtherTabs(sorted);

      // Persist directly to Supabase
      const targetUpdated = sorted.find((u) => u.userId === userId);
      if (targetUpdated) {
        upsertUserInSupabase(targetUpdated).catch((err) => {
          console.warn('[Supabase] Direct upsert note:', err);
        });
      }

      // Persist to server
      syncUsersToApi(sorted);

      const newRank = sorted.findIndex((u) => u.userId === userId) + 1;

      if (count > 0 && newTickets > oldTickets) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
        });
        showToast(
          `🎉 🎟️ NEW TICKET UNLOCKED! ${userId} reached ${newDirect} Directs (${newTickets} Tickets, Rank #${newRank})!`
        );
      } else if (count < 0) {
        showToast(
          `🔻 ${userId}: ${count} Direct! Total Directs: ${newDirect} (${newTickets} Tickets, Rank #${newRank})`
        );
      } else {
        showToast(
          `⚡ ${userId}: +${count} Direct! Total Directs: ${newDirect} (Rank #${newRank})`
        );
      }
    },
    [isAdmin, users, showToast]
  );

  // Save manual edits from modal (persists name, ID, directs to server and other clients)
  const handleSaveEditedUser = useCallback((updated: LeaderboardUser) => {
    setUsers((prev) => {
      const list = prev.map((u) => (u.id === updated.id ? updated : u));
      const sorted = sortLeaderboard(list);
      saveUsersToStorage(sorted);
      broadcastToOtherTabs(sorted);
      return sorted;
    });

    // Save directly to Supabase
    upsertUserInSupabase(updated).catch((err) => {
      console.warn('[Supabase] Edit upsert error:', err);
    });

    // Save to server so all devices update
    editUserOnApi(updated).then((serverList) => {
      if (serverList) {
        setUsers(serverList);
        saveUsersToStorage(serverList);
        broadcastToOtherTabs(serverList);
      }
    });

    showToast(`✅ Member ${updated.userId} updated & saved to Supabase cloud database.`);
  }, [showToast]);

  // Reset to initial 26 members
  const handleResetData = useCallback(async () => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    if (
      window.confirm(
        'Reset leaderboard to the default initial 26 SMARTPAY360 contest participants?'
      )
    ) {
      // Seed/reset in Supabase
      seedOrResetSupabaseUsers();

      const serverList = await resetUsersOnApi();
      const finalList = serverList || sortLeaderboard(INITIAL_LEADERBOARD_USERS);
      setUsers(finalList);
      saveUsersToStorage(finalList);
      broadcastToOtherTabs(finalList);
      showToast('🔄 Leaderboard reset to original contest snapshot across Supabase & all devices.');
    }
  }, [isAdmin, showToast]);

  const scrollToUpgrade = () => {
    const el = document.getElementById('quick-upgrade-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      const input = document.getElementById('input-user-id');
      if (input) input.focus();
    }
  };

  const topThree = useMemo(() => users.slice(0, 3), [users]);

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans relative overflow-x-hidden transition-colors duration-500"
      style={{ backgroundColor: currentTheme.bgBaseColor || '#07090e' }}
    >
      {/* Dynamic Ambient Background Illumination for High-End Depth */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-700"
        style={{
          opacity:
            currentTheme.glowIntensity === 'off'
              ? 0
              : currentTheme.glowIntensity === 'subtle'
              ? 0.45
              : 1,
        }}
      >
        {/* Subtle Warm Crown Glow at Top */}
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[400px] blur-[120px] rounded-full pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(ellipse at center, ${currentTheme.glowColor1 || 'rgba(245,158,11,0.12)'} 0%, transparent 70%)`,
          }}
        />
        {/* Atmospheric Glow in Background */}
        <div
          className="absolute top-[35%] right-[-5%] w-[600px] h-[600px] blur-[140px] rounded-full pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${currentTheme.glowColor2 || 'rgba(37,99,235,0.06)'} 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute top-[65%] left-[-5%] w-[600px] h-[600px] blur-[150px] rounded-full pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${currentTheme.glowColor1 || 'rgba(245,158,11,0.05)'} 0%, transparent 70%)`,
          }}
        />

        {/* Dynamic Texture Pattern Overlay */}
        {currentTheme.patternStyle === 'dots' && (
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.05]" />
        )}
        {currentTheme.patternStyle === 'grid' && (
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        )}
        {currentTheme.patternStyle === 'mesh' && (
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 40px)',
            }}
          />
        )}
      </div>

      {/* Top Navbar with Admin controls */}
      <Navbar
        isAdmin={isAdmin}
        currentView={currentView}
        onNavigateToAdmin={navigateToAdmin}
        onNavigateToLeaderboard={navigateToLeaderboard}
        onLogout={handleAdminLogout}
        onOpenBroadcast={() => setIsBroadcastOpen(true)}
        onResetData={handleResetData}
        onScrollToUpgrade={scrollToUpgrade}
        onOpenCashRewards={() => setRewardsModalState({ isOpen: true, initialTab: 'cash' })}
        onOpenGiftsModal={() => setRewardsModalState({ isOpen: true, initialTab: 'gifts' })}
        totalUsers={users.length}
        totalTickets={users.reduce((s, u) => s + u.ticketCount, 0)}
        isLight={currentTheme.isLight}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'admin' ? (
          <AdminPortal
            isAdmin={isAdmin}
            users={users}
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
            onLoginSuccess={handleAdminLoginSuccess}
            onLogout={handleAdminLogout}
            onNavigateToLeaderboard={navigateToLeaderboard}
            onUpgradeUser={handleUpgradeUser}
            onQuickAddDirect={(id, count) => handleQuickAddDirect(id, count || 1)}
            onEditUser={(u) => setEditingUser(u)}
            onOpenBroadcast={() => setIsBroadcastOpen(true)}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            onManualRefresh={handleManualRefresh}
            onResetData={handleResetData}
            isSyncing={isSyncing}
            showToast={showToast}
          />
        ) : (
          <>
            {/* SmartPay 360 Official Poster Branding Header Banner */}
            <SmartPayPosterHeader currentTheme={currentTheme} />

            {/* Top Actions & Rewards Bar (Buttons for Top 10 Cash and 40 Lucky Draw Gifts + Live Sync Status) */}
            <TopActionsBar
              onOpenCashRewards={() => setRewardsModalState({ isOpen: true, initialTab: 'cash' })}
              onOpenGiftsModal={() => setRewardsModalState({ isOpen: true, initialTab: 'gifts' })}
              onManualRefresh={handleManualRefresh}
              onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
              isSyncing={isSyncing}
              isLiveConnected={isLiveConnected}
              isSupabaseLive={isSupabaseLive}
              totalUsers={users.length}
              totalTickets={users.reduce((s, u) => s + u.ticketCount, 0)}
              isLight={currentTheme.isLight}
            />

            {/* Fast User ID & Direct Upgrade System (Admin Only - Appears upon Login) */}
            {isAdmin && (
              <QuickUpgradeBar
                isAdmin={isAdmin}
                onOpenLogin={() => {}}
                onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
                users={users}
                onUpgradeUser={handleUpgradeUser}
              />
            )}

            {/* Top 3 Podium Highlights with Cash Badges - Front & Center */}
            {users.length >= 3 && (
              <LeaderboardPodium
                isAdmin={isAdmin}
                topThree={topThree}
                onQuickAddDirect={(id, count) => handleQuickAddDirect(id, count || 1)}
                onSelectUser={(u) => {
                  if (isAdmin) setEditingUser(u);
                }}
                isLight={currentTheme.isLight}
              />
            )}

            {/* Complete Live Leaderboard Table with Top 10 Cash status - Immediately Visible */}
            <LeaderboardTable
              isAdmin={isAdmin}
              users={users}
              onQuickAddDirect={(id, count) => handleQuickAddDirect(id, count || 1)}
              onEditUser={(u) => {
                if (isAdmin) setEditingUser(u);
              }}
              isLight={currentTheme.isLight}
            />

            {/* Public User "Check My Live Rank" Search Card */}
            <CheckRankCard users={users} />

            {/* Live Metrics: Total User, Total Direct, Total Ticket */}
            <StatsCards users={users} />

            {/* Rules & Contest Notice */}
            <NoticeBanner />

            {/* Official SmartPay Poster Footer with Motivational Callout & Pillars */}
            <SmartPayPosterFooter currentTheme={currentTheme} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#080c16]/90 backdrop-blur-md py-8 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-black shadow-sm">
              S
            </div>
            <span className="font-extrabold text-white tracking-wide">SMARTPAY360</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-medium">Live Ticket & Lucky Draw Leaderboard</span>
          </div>
          <div className="text-slate-400 font-medium flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-emerald-400 border border-slate-700/60 text-[11px] font-bold">
              👥 5 Direct = 🎟️ 1 Ticket
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-amber-300 border border-slate-700/60 text-[11px] font-bold">
              💰 Top 10 Cash Rewards
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-amber-500/50 text-white shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* WhatsApp / Telegram Broadcast Modal */}
      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        users={users}
      />

      {/* User Edit Modal (Admin only - now edits both User ID and Name) */}
      <UserEditModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveEditedUser}
      />

      {/* Rewards & Prizes Modal (Contains Top 10 Cash Rewards & 40 Lucky Draw Gifts List) */}
      <RewardsModal
        isOpen={rewardsModalState.isOpen}
        initialTab={rewardsModalState.initialTab}
        onClose={() => setRewardsModalState((prev) => ({ ...prev, isOpen: false }))}
        users={users}
      />

      {/* Supabase PostgreSQL & Realtime Database Sync Modal */}
      <SupabaseSyncModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        users={users}
        onSyncSuccess={() => showToast('✅ Supabase database synchronized successfully!')}
      />
    </div>
  );
}
