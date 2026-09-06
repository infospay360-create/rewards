import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, ShieldCheck } from 'lucide-react';
import { LeaderboardUser } from './types';
import { INITIAL_LEADERBOARD_USERS } from './data/initialData';
import {
  loadUsersFromStorage,
  saveUsersToStorage,
  sortLeaderboard,
  calculateTickets,
  checkAdminSession,
  saveAdminSession,
  fetchUsersFromApi,
  syncUsersToApi,
  upgradeUserOnApi,
  editUserOnApi,
  resetUsersOnApi,
} from './utils/leaderboardUtils';
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

export default function App() {
  const [users, setUsers] = useState<LeaderboardUser[]>(() => {
    return sortLeaderboard(loadUsersFromStorage());
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return checkAdminSession();
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<LeaderboardUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

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

  // Save to localStorage as local cache
  useEffect(() => {
    saveUsersToStorage(users);
  }, [users]);

  // Initial load from server & real-time SSE + anti-cache background sync across all devices
  useEffect(() => {
    let isMounted = true;
    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const syncWithServer = async (silent = true) => {
      if (!silent) setIsSyncing(true);
      const serverUsers = await fetchUsersFromApi();
      if (isMounted && serverUsers && serverUsers.length > 0) {
        setUsers((prev) => {
          const prevStr = JSON.stringify(prev);
          const newStr = JSON.stringify(serverUsers);
          if (prevStr !== newStr) {
            saveUsersToStorage(serverUsers);
            return serverUsers;
          }
          return prev;
        });
        setIsLiveConnected(true);
      }
      if (!silent) setIsSyncing(false);
    };

    // Immediate initial sync
    syncWithServer(false);

    // Setup Real-Time Server-Sent Events (SSE) stream
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
              const sorted = sortLeaderboard(data.users);
              setUsers(sorted);
              saveUsersToStorage(sorted);
              setIsLiveConnected(true);
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

    // Continuous polling every 3.5 seconds with zero-cache headers for absolute reliability
    const pollInterval = setInterval(() => {
      syncWithServer(true);
    }, 3500);

    // Also sync immediately when user switches tabs or focuses browser
    const handleFocus = () => {
      syncWithServer(true);
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  // Manual refresh trigger
  const handleManualRefresh = useCallback(async () => {
    setIsSyncing(true);
    const fresh = await fetchUsersFromApi();
    if (fresh && fresh.length > 0) {
      setUsers(fresh);
      saveUsersToStorage(fresh);
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

  // Primary upgrade function (implements "me bas user id dalo aur direct totel user system automatically upgrade kare")
  const handleUpgradeUser = useCallback(
    async (data: { userId: string; name?: string; directCount: number; isAdditive?: boolean }) => {
      const cleanId = data.userId.trim().toUpperCase();
      let isNew = false;
      let oldTickets = 0;
      let newTickets = 0;

      const existingIndex = users.findIndex((u) => u.userId.toUpperCase() === cleanId);
      let updatedList: LeaderboardUser[];

      if (existingIndex >= 0) {
        const current = users[existingIndex];
        oldTickets = current.ticketCount;
        const newDirect = data.isAdditive
          ? current.directCount + data.directCount
          : data.directCount;
        newTickets = calculateTickets(newDirect, current.customTicketBonus || 0);

        const updatedUser: LeaderboardUser = {
          ...current,
          name: data.name || current.name,
          directCount: Math.max(0, newDirect),
          ticketCount: newTickets,
          updatedAt: new Date().toISOString(),
        };

        updatedList = [...users];
        updatedList[existingIndex] = updatedUser;
      } else {
        isNew = true;
        oldTickets = 0;
        const directs = Math.max(0, data.directCount);
        newTickets = calculateTickets(directs);

        const newUser: LeaderboardUser = {
          id: `user-${Date.now()}`,
          userId: cleanId,
          name: data.name || `Leader ${cleanId.slice(-4)}`,
          directCount: directs,
          ticketCount: newTickets,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        updatedList = [newUser, ...users];
      }

      // Automatically sort
      const sorted = sortLeaderboard(updatedList);
      setUsers(sorted);
      saveUsersToStorage(sorted);

      const newRank = sorted.findIndex((u) => u.userId.toUpperCase() === cleanId) + 1;

      // Sync with cloud server so all browsers & mobile devices see it
      upgradeUserOnApi(data).then((res) => {
        if (res && res.users) {
          setUsers(res.users);
          saveUsersToStorage(res.users);
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

  // Save manual edits from modal (persists name, ID, directs to server)
  const handleSaveEditedUser = useCallback((updated: LeaderboardUser) => {
    setUsers((prev) => {
      const list = prev.map((u) => (u.id === updated.id ? updated : u));
      const sorted = sortLeaderboard(list);
      saveUsersToStorage(sorted);
      return sorted;
    });

    // Save to server so all devices update
    editUserOnApi(updated).then((serverList) => {
      if (serverList) {
        setUsers(serverList);
        saveUsersToStorage(serverList);
      }
    });

    showToast(`✅ Member ${updated.userId} updated & saved to cloud server.`);
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
      const serverList = await resetUsersOnApi();
      const finalList = serverList || sortLeaderboard(INITIAL_LEADERBOARD_USERS);
      setUsers(finalList);
      saveUsersToStorage(finalList);
      showToast('🔄 Leaderboard reset to original contest snapshot across all devices.');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Navbar with Admin controls */}
      <Navbar
        isAdmin={isAdmin}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleAdminLogout}
        onOpenBroadcast={() => setIsBroadcastOpen(true)}
        onResetData={handleResetData}
        onScrollToUpgrade={scrollToUpgrade}
        onOpenCashRewards={() => setRewardsModalState({ isOpen: true, initialTab: 'cash' })}
        onOpenGiftsModal={() => setRewardsModalState({ isOpen: true, initialTab: 'gifts' })}
        totalUsers={users.length}
        totalTickets={users.reduce((s, u) => s + u.ticketCount, 0)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Actions & Rewards Bar (Buttons for Top 10 Cash and 40 Lucky Draw Gifts + Live Sync Status) */}
        <TopActionsBar
          onOpenCashRewards={() => setRewardsModalState({ isOpen: true, initialTab: 'cash' })}
          onOpenGiftsModal={() => setRewardsModalState({ isOpen: true, initialTab: 'gifts' })}
          onManualRefresh={handleManualRefresh}
          isSyncing={isSyncing}
          isLiveConnected={isLiveConnected}
          totalUsers={users.length}
          totalTickets={users.reduce((s, u) => s + u.ticketCount, 0)}
        />

        {/* Fast User ID & Direct Upgrade System (Admin Only - Appears upon Login) */}
        {isAdmin && (
          <QuickUpgradeBar
            isAdmin={isAdmin}
            onOpenLogin={() => setIsLoginModalOpen(true)}
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
        />

        {/* Public User "Check My Live Rank" Search Card */}
        <CheckRankCard users={users} />

        {/* Live Metrics: Total User, Total Direct, Total Ticket */}
        <StatsCards users={users} />

        {/* Rules & Contest Notice */}
        <NoticeBanner />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">SMARTPAY360</span>
            <span>•</span>
            <span>Live Ticket & Top 10 Cash Leaderboard</span>
          </div>
          <div className="text-slate-400">
            👥 5 Direct = 🎟️ 1 Ticket • 💰 Cash Rewards Prize Pool (Top 10)
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
    </div>
  );
}
