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
} from './utils/leaderboardUtils';
import { Navbar } from './components/Navbar';
import { Top10CashBanner } from './components/Top10CashBanner';
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

  // Sync to localStorage whenever users change
  useEffect(() => {
    saveUsersToStorage(users);
  }, [users]);

  // Show transient toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const handleAdminLoginSuccess = useCallback(() => {
    setIsAdmin(true);
    saveAdminSession(true);
    showToast('👑 Admin Logged In! You can now add user IDs and update directs.');
  }, [showToast]);

  const handleAdminLogout = useCallback(() => {
    setIsAdmin(false);
    saveAdminSession(false);
    showToast('Logged out of Admin mode. Viewing public leaderboard.');
  }, [showToast]);

  // Primary upgrade function (implements "me bas user id dalo aur direct totel user system automatically upgrade kare")
  const handleUpgradeUser = useCallback(
    (data: { userId: string; name?: string; directCount: number; isAdditive?: boolean }) => {
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

      // Automatically sort so whoever has more direct/tickets stays on top
      const sorted = sortLeaderboard(updatedList);
      setUsers(sorted);

      const newRank = sorted.findIndex((u) => u.userId.toUpperCase() === cleanId) + 1;
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
      const newDirect = target.directCount + count;
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

      const newRank = sorted.findIndex((u) => u.userId === userId) + 1;

      if (newTickets > oldTickets) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
        });
        showToast(
          `🎉 🎟️ NEW TICKET UNLOCKED! ${userId} reached ${newDirect} Directs (${newTickets} Tickets, Rank #${newRank})!`
        );
      } else {
        showToast(
          `⚡ ${userId}: +${count} Direct! Total Directs: ${newDirect} (Rank #${newRank})`
        );
      }
    },
    [isAdmin, users, showToast]
  );

  // Save manual edits from modal
  const handleSaveEditedUser = useCallback((updated: LeaderboardUser) => {
    setUsers((prev) => {
      const list = prev.map((u) => (u.id === updated.id ? updated : u));
      return sortLeaderboard(list);
    });
  }, []);

  // Delete user
  const handleDeleteUser = useCallback((userId: string) => {
    setUsers((prev) => {
      const list = prev.filter((u) => u.userId !== userId);
      return sortLeaderboard(list);
    });
  }, []);

  // Reset to the initial 26 members
  const handleResetData = useCallback(() => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    if (
      window.confirm(
        'Reset leaderboard to the default initial 26 SMARTPAY360 contest participants?'
      )
    ) {
      const sorted = sortLeaderboard(INITIAL_LEADERBOARD_USERS);
      setUsers(sorted);
      saveUsersToStorage(sorted);
      showToast('🔄 Leaderboard reset to original contest snapshot.');
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
        totalUsers={users.length}
        totalTickets={users.reduce((s, u) => s + u.ticketCount, 0)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top 10 Cash Distribution Bonanza Banner */}
        <Top10CashBanner users={users} />

        {/* Public User "Check My Live Rank" Search Card */}
        <CheckRankCard users={users} />

        {/* Live Metrics: Total User, Total Direct, Total Ticket */}
        <StatsCards users={users} />

        {/* Fast User ID & Direct Upgrade System (Admin Only / Login Prompt) */}
        <QuickUpgradeBar
          isAdmin={isAdmin}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          users={users}
          onUpgradeUser={handleUpgradeUser}
        />

        {/* Top 3 Podium Highlights with Cash Badges */}
        {users.length >= 3 && (
          <LeaderboardPodium
            isAdmin={isAdmin}
            topThree={topThree}
            onQuickAddDirect={(id) => handleQuickAddDirect(id, 1)}
            onSelectUser={(u) => {
              if (isAdmin) setEditingUser(u);
            }}
          />
        )}

        {/* Complete Live Leaderboard Table with Top 10 Cash status */}
        <LeaderboardTable
          isAdmin={isAdmin}
          users={users}
          onQuickAddDirect={(id, count) => handleQuickAddDirect(id, count || 1)}
          onEditUser={(u) => {
            if (isAdmin) setEditingUser(u);
          }}
        />

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
            👥 5 Direct = 🎟️ 1 Ticket • 💰 ₹10,750 Top 10 Cash Distribution
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

      {/* User Edit Modal (Admin only) */}
      <UserEditModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveEditedUser}
        onDelete={handleDeleteUser}
      />
    </div>
  );
}
