import React, { useState } from 'react';
import {
  Trophy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Gift,
  RefreshCw,
  Search,
  Save,
  X,
  Zap,
  HelpCircle,
  Crown,
} from 'lucide-react';
import { RewardWinner, WinnersSettings, LeaderboardUser } from '../types';
import { DEFAULT_CASH_RANKS, generateWinnersFromTop10 } from '../utils/winnerUtils';

interface AdminWinnersManagerProps {
  users: LeaderboardUser[];
  winnersSettings: WinnersSettings;
  onUpdateWinnersSettings: (newSettings: WinnersSettings) => void;
  showToast: (msg: string) => void;
  isLight?: boolean;
}

export const AdminWinnersManager: React.FC<AdminWinnersManagerProps> = ({
  users,
  winnersSettings,
  onUpdateWinnersSettings,
  showToast,
  isLight = false,
}) => {
  // Modal / Form state for adding/editing a winner
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [formUserId, setFormUserId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'cash_top10' | 'lucky_draw' | 'mega_bonus' | 'special_gift'>('cash_top10');
  const [formRank, setFormRank] = useState<string>('1');
  const [formPrizeTitle, setFormPrizeTitle] = useState('🥇 1st Prize: ₹51,000 Cash');
  const [formPrizeValue, setFormPrizeValue] = useState('₹51,000 Cash');
  const [formClaimStatus, setFormClaimStatus] = useState<'CLAIMED' | 'VERIFIED' | 'PENDING' | 'DISBURSED'>('VERIFIED');
  const [formBadgeNote, setFormBadgeNote] = useState('Grand Champion 🏆');

  // Title edit state
  const [announcementTitle, setAnnouncementTitle] = useState(winnersSettings.title);
  const [announcementSubtitle, setAnnouncementSubtitle] = useState(winnersSettings.announcementSubtitle || '');
  const [isTitleEditing, setIsTitleEditing] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Toggle Show / Hide Winner List (Instant Supabase & Server Live Sync)
  const handleToggleVisibility = async () => {
    const nextState = !winnersSettings.isVisible;
    const updated: WinnersSettings = {
      ...winnersSettings,
      isVisible: nextState,
      lastUpdated: new Date().toISOString(),
    };
    onUpdateWinnersSettings(updated);

    // Call server endpoint directly for immediate persistence & SSE push
    try {
      await fetch('/api/winners/toggle-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: nextState }),
      });
    } catch (e) {
      console.warn('Toggle visibility API note:', e);
    }

    if (nextState) {
      showToast('🟢 Winner List ab sabhi visitors ko Top me LIVE dikh rahi hai (Supabase & Mobile Sync)!');
    } else {
      showToast('🔴 Winner List ab website se CHUP (HIDE) ho gayi hai (Sabhi mobile me turant gayab)!');
    }
  };

  // 2. Fast Auto-Populate from Current Top 10 Leaders
  const handleAutoPopulateTop10 = () => {
    if (users.length === 0) {
      showToast('⚠️ No leaderboard users found to populate from.');
      return;
    }
    const autoWinners = generateWinnersFromTop10(users);
    // Keep any existing lucky draw winners and replace cash winners
    const existingLuckyDraws = winnersSettings.winners.filter((w) => w.prizeCategory !== 'cash_top10');
    const updated: WinnersSettings = {
      ...winnersSettings,
      winners: [...autoWinners, ...existingLuckyDraws],
      lastUpdated: new Date().toISOString(),
    };
    onUpdateWinnersSettings(updated);
    showToast('⚡ Leaderboard ke Top 10 leaders ko Winners list me auto-add kar diya gaya!');
  };

  // User Selection change
  const handleSelectContestant = (userId: string) => {
    setFormUserId(userId);
    const found = users.find((u) => u.userId.toUpperCase() === userId.toUpperCase());
    if (found) {
      setFormName(found.name);
    }
  };

  // Rank / Preset selection change
  const handlePresetRank = (rankNum: number) => {
    const preset = DEFAULT_CASH_RANKS.find((r) => r.rank === rankNum);
    if (preset) {
      setFormCategory('cash_top10');
      setFormRank(String(preset.rank));
      setFormPrizeTitle(preset.title);
      setFormPrizeValue(preset.value);
      setFormBadgeNote(preset.badge);
    }
  };

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormUserId(users[0]?.userId || 'SPAY');
    setFormName(users[0]?.name || '');
    setFormCategory('cash_top10');
    setFormRank('1');
    setFormPrizeTitle('🥇 1st Prize: ₹51,000 Cash');
    setFormPrizeValue('₹51,000 Cash');
    setFormClaimStatus('VERIFIED');
    setFormBadgeNote('Grand Champion 🏆');
    setIsEditing(true);
  };

  // Open Edit modal for existing
  const handleOpenEdit = (winner: RewardWinner) => {
    setEditingId(winner.id);
    setFormUserId(winner.userId);
    setFormName(winner.name);
    setFormCategory(winner.prizeCategory);
    setFormRank(String(winner.rankOrPosition));
    setFormPrizeTitle(winner.prizeTitle);
    setFormPrizeValue(winner.prizeValue);
    setFormClaimStatus(winner.claimStatus || 'VERIFIED');
    setFormBadgeNote(winner.badgeNote || '');
    setIsEditing(true);
  };

  // Save winner (Add or Update)
  const handleSaveWinner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUserId.trim() || !formName.trim() || !formPrizeTitle.trim()) {
      showToast('⚠️ Kripya Winner ka Name, User ID aur Prize detail fill karein.');
      return;
    }

    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    let updatedList = [...winnersSettings.winners];

    if (editingId) {
      // Update existing
      updatedList = updatedList.map((w) => {
        if (w.id === editingId) {
          return {
            ...w,
            userId: formUserId.trim().toUpperCase(),
            name: formName.trim(),
            prizeCategory: formCategory,
            rankOrPosition: formRank,
            prizeTitle: formPrizeTitle.trim(),
            prizeValue: formPrizeValue.trim(),
            claimStatus: formClaimStatus,
            badgeNote: formBadgeNote.trim(),
          };
        }
        return w;
      });
      showToast(`✅ Winner "${formName}" updated successfully!`);
    } else {
      // Add new
      const newWinner: RewardWinner = {
        id: `win-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: formUserId.trim().toUpperCase(),
        name: formName.trim(),
        prizeCategory: formCategory,
        rankOrPosition: formRank,
        prizeTitle: formPrizeTitle.trim(),
        prizeValue: formPrizeValue.trim(),
        announcedDate: today,
        claimStatus: formClaimStatus,
        badgeNote: formBadgeNote.trim(),
      };
      updatedList.unshift(newWinner);
      showToast(`🎉 New Winner "${formName}" added to the list!`);
    }

    const nextSettings: WinnersSettings = {
      ...winnersSettings,
      winners: updatedList,
      lastUpdated: new Date().toISOString(),
    };
    onUpdateWinnersSettings(nextSettings);
    setIsEditing(false);
  };

  // Delete winner
  const handleDeleteWinner = (id: string, name: string) => {
    const filtered = winnersSettings.winners.filter((w) => w.id !== id);
    const nextSettings: WinnersSettings = {
      ...winnersSettings,
      winners: filtered,
      lastUpdated: new Date().toISOString(),
    };
    onUpdateWinnersSettings(nextSettings);
    showToast(`🗑️ Winner "${name}" removed from list.`);
  };

  // Save Announcement Titles
  const handleSaveTitles = () => {
    const updated: WinnersSettings = {
      ...winnersSettings,
      title: announcementTitle.trim() || '🏆 SmartPay 360 Official Rewards & Winners Announcement 🎊',
      announcementSubtitle: announcementSubtitle.trim(),
      lastUpdated: new Date().toISOString(),
    };
    onUpdateWinnersSettings(updated);
    setIsTitleEditing(false);
    showToast('✅ Announcement Headline updated!');
  };

  // Filtered Winners
  const filteredWinners = winnersSettings.winners.filter((w) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      w.name.toLowerCase().includes(q) ||
      w.userId.toLowerCase().includes(q) ||
      w.prizeTitle.toLowerCase().includes(q) ||
      w.prizeValue.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. MASTER SHOW / HIDE CONTROL CARD */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-all ${
          winnersSettings.isVisible
            ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-amber-950/30 border-emerald-500/50 shadow-xl shadow-emerald-500/10'
            : 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40 shadow-xl'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  winnersSettings.isVisible
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    winnersSettings.isVisible ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                {winnersSettings.isVisible ? 'LIVE ON SITE (VISIBLE TO PUBLIC)' : 'HIDDEN FROM PUBLIC'}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {winnersSettings.winners.length} Winners in List
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Public Winners Announcement Display Control</span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {winnersSettings.isVisible
                ? '🟢 Yeh Winner List abhi sabhi contestants & visitors ko website ke sabse upar (Top) live dikhai de rahi hai. Chupane ke liye "Hide from Website" button dabayein.'
                : '🔴 Winner List abhi visitors se CHUP (HIDE) hai. Jab aap winner declare karna chahein, to "Show Live on Website" button dabayein.'}
            </p>
          </div>

          {/* Big Action Toggle Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleToggleVisibility}
              className={`px-5 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                winnersSettings.isVisible
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30 ring-2 ring-rose-400/30'
                  : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/30'
              }`}
            >
              {winnersSettings.isVisible ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Hide from Website (Chupayein)</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Show Live on Website (Live Dikhayein)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. HEADER TITLE & QUICK ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Winners Announcement Banner Headline</span>
          </div>
          {isTitleEditing ? (
            <div className="space-y-2 pt-1">
              <input
                type="text"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-amber-500 text-white focus:outline-none"
                placeholder="Banner Main Headline..."
              />
              <input
                type="text"
                value={announcementSubtitle}
                onChange={(e) => setAnnouncementSubtitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none"
                placeholder="Sub-headline / description..."
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveTitles}
                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                >
                  <Save className="w-3 h-3" /> Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsTitleEditing(false)}
                  className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{winnersSettings.title}</span>
              <button
                type="button"
                onClick={() => setIsTitleEditing(true)}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Edit2 className="w-3 h-3" /> Edit Headline
              </button>
            </div>
          )}
        </div>

        {/* Buttons: Auto Populate Top 10 & Add Winner */}
        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
          <button
            type="button"
            onClick={handleAutoPopulateTop10}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
            title="Auto-fill Rank 1-10 cash winners based on current live leaderboard"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Auto-Draft Top 10 Leaders</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-black shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Winner</span>
          </button>
        </div>
      </div>

      {/* 3. SEARCH & TABLE OF CURRENT WINNERS */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white">
              Winners Roster ({winnersSettings.winners.length} Listed)
            </h4>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in winners list..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Table or Empty State */}
        {filteredWinners.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Trophy className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            Abhi koi winner list me nahi hai. Upar diye gaye "Auto-Draft Top 10 Leaders" ya "Add New Winner" button se add karein.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800/60 text-slate-400 border-b border-slate-700/80 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-3">Position</th>
                  <th className="py-3 px-3">Winner Name</th>
                  <th className="py-3 px-3">User ID</th>
                  <th className="py-3 px-3">Prize Title & Value</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredWinners.map((winner, idx) => {
                  const isTop3 =
                    winner.rankOrPosition === 1 ||
                    winner.rankOrPosition === 2 ||
                    winner.rankOrPosition === 3 ||
                    winner.rankOrPosition === '1' ||
                    winner.rankOrPosition === '2' ||
                    winner.rankOrPosition === '3';

                  return (
                    <tr
                      key={winner.id || `win-row-${idx}`}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3 font-black">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs ${
                            isTop3
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black'
                              : 'bg-slate-800 text-slate-300 border border-slate-700 font-bold'
                          }`}
                        >
                          #{winner.rankOrPosition}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{winner.name}</div>
                        {winner.badgeNote && (
                          <div className="text-[10px] text-amber-400 font-medium">
                            {winner.badgeNote}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-amber-400">
                        {winner.userId}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{winner.prizeTitle}</div>
                        <div className="text-[11px] font-black text-emerald-400">
                          {winner.prizeValue}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            winner.prizeCategory === 'cash_top10'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          }`}
                        >
                          {winner.prizeCategory === 'cash_top10' ? 'Top 10 Cash' : 'Lucky Draw'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            winner.claimStatus === 'DISBURSED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : winner.claimStatus === 'VERIFIED'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {winner.claimStatus || 'VERIFIED'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(winner)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white transition-colors"
                            title="Edit Winner"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteWinner(winner.id, winner.name)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors"
                            title="Delete Winner"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. ADD / EDIT WINNER MODAL DIALOG */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-amber-500/40 p-5 sm:p-6 shadow-2xl text-white">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black">
                  {editingId ? 'Edit Winner Details' : 'Add New Prize Winner'}
                </h3>
                <p className="text-xs text-slate-400">
                  Update prize declaration, winner identity, and category.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveWinner} className="space-y-3.5">
              {/* Contestant Quick Select */}
              {users.length > 0 && !editingId && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Quick Select from Contestants
                  </label>
                  <select
                    onChange={(e) => handleSelectContestant(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Choose from Leaderboard or type below --</option>
                    {users.slice(0, 30).map((u, i) => (
                      <option key={u.id} value={u.userId}>
                        #{i + 1} {u.name} ({u.userId}) - {u.directCount} Directs, {u.ticketCount} Tickets
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* User ID & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    User ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formUserId}
                    onChange={(e) => setFormUserId(e.target.value)}
                    placeholder="e.g. SPAY330606"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Winner Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Babla Paul"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons for Top 10 Cash Ranks */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  Quick Cash Prize Presets (Ranks 1 to 10)
                </label>
                <div className="flex flex-wrap gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handlePresetRank(r)}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                        formRank === String(r)
                          ? 'bg-amber-500 text-amber-950 border-amber-400'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      Rank {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category & Rank */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Prize Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="cash_top10">💰 Guaranteed Cash (Top 10)</option>
                    <option value="lucky_draw">🎁 Lucky Draw Prize</option>
                    <option value="mega_bonus">🚀 Mega Jackpot Bonus</option>
                    <option value="special_gift">🌟 Special Gift</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Position / Rank Label
                  </label>
                  <input
                    type="text"
                    required
                    value={formRank}
                    onChange={(e) => setFormRank(e.target.value)}
                    placeholder="e.g. 1 or Lucky Draw #5"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Prize Title & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Prize Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPrizeTitle}
                    onChange={(e) => setFormPrizeTitle(e.target.value)}
                    placeholder="e.g. 1st Prize: ₹51,000 Cash"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Prize Amount / Item *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPrizeValue}
                    onChange={(e) => setFormPrizeValue(e.target.value)}
                    placeholder="e.g. ₹51,000 Cash or Smartphone"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Claim Status & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Verification Status
                  </label>
                  <select
                    value={formClaimStatus}
                    onChange={(e) => setFormClaimStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="VERIFIED">VERIFIED (Declared & Verified)</option>
                    <option value="DISBURSED">DISBURSED (Prize Sent/Paid)</option>
                    <option value="CLAIMED">CLAIMED (Claim Under Review)</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Special Note / Badge
                  </label>
                  <input
                    type="text"
                    value={formBadgeNote}
                    onChange={(e) => setFormBadgeNote(e.target.value)}
                    placeholder="e.g. Grand Champion 🏆"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 text-xs font-black shadow-md active:scale-95 transition-all"
                >
                  {editingId ? 'Update Winner' : 'Publish Winner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
