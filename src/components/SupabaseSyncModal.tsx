import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  RefreshCw,
  X,
  Radio,
  ShieldCheck,
  Zap,
  Smartphone,
  Settings,
  HelpCircle,
  Check,
  Trophy,
} from 'lucide-react';
import {
  DEFAULT_SUPABASE_PROJECT_ID,
  SUPABASE_SQL_SCHEMA,
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  checkSupabaseStatus,
  seedOrResetSupabaseUsers,
  upsertWinnersInSupabase,
} from '../lib/supabase';
import { getStoredWinnersSettings } from '../utils/winnerUtils';
import { LeaderboardUser } from '../types';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: LeaderboardUser[];
  onSyncSuccess?: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  users,
  onSyncSuccess,
}) => {
  const [config, setConfig] = useState(getStoredSupabaseConfig());
  const [status, setStatus] = useState<{
    loading: boolean;
    connected: boolean;
    tableExists: boolean;
    rowCount: number;
    winnersTableExists: boolean;
    winnersCount: number;
    error?: string;
  }>({
    loading: true,
    connected: false,
    tableExists: false,
    rowCount: 0,
    winnersTableExists: false,
    winnersCount: 0,
  });

  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Custom Supabase Credentials Form State
  const [showConfigEdit, setShowConfigEdit] = useState(false);
  const [customUrl, setCustomUrl] = useState(config.url);
  const [customKey, setCustomKey] = useState(config.anonKey);
  const [configSavedToast, setConfigSavedToast] = useState(false);

  const checkStatus = async () => {
    setStatus((prev) => ({ ...prev, loading: true }));
    const res = await checkSupabaseStatus();
    setStatus({
      loading: false,
      connected: res.connected,
      tableExists: res.tableExists,
      rowCount: res.rowCount,
      winnersTableExists: res.winnersTableExists,
      winnersCount: res.winnersCount,
      error: res.error,
    });
  };

  useEffect(() => {
    if (isOpen) {
      const currentConfig = getStoredSupabaseConfig();
      setConfig(currentConfig);
      setCustomUrl(currentConfig.url);
      setCustomKey(currentConfig.anonKey);
      checkStatus();
      setSyncFeedback(null);
    }
  }, [isOpen]);

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = SUPABASE_SQL_SCHEMA;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handlePushToSupabase = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      // Seed directly from client
      const ok = await seedOrResetSupabaseUsers(users);
      if (ok) {
        setSyncFeedback(`✅ Supabase database me sabhi ${users.length} users successfully push ho gaye!`);
        await checkStatus();
        if (onSyncSuccess) onSyncSuccess();
      } else {
        // Try server endpoint
        const srvRes = await fetch('/api/supabase/seed', { method: 'POST' });
        if (srvRes.ok) {
          setSyncFeedback(`✅ Server ke dwara Supabase me users sync ho gaye!`);
          await checkStatus();
          if (onSyncSuccess) onSyncSuccess();
        } else {
          setSyncFeedback(
            '⚠️ Supabase me table `leaderboard_users` nahi mili. Kripya pehle neeche diye gaye SQL script ko Supabase SQL Editor me jakar RUN karein!'
          );
        }
      }
    } catch (err: any) {
      setSyncFeedback(`⚠️ Error: ${err?.message || 'Sync failed'}`);
    }
    setIsSyncing(false);
  };

  const handlePushWinnersToSupabase = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const currentWinners = getStoredWinnersSettings();
      const ok = await upsertWinnersInSupabase(currentWinners);
      await fetch('/api/supabase/seed-winners', { method: 'POST' }).catch(() => {});
      if (ok) {
        setSyncFeedback(`✅ Supabase me Contest Winners (${currentWinners.winners.length} winners) table successfully push ho gayi! (Visibility: ${currentWinners.isVisible ? 'LIVE' : 'HIDDEN'})`);
        await checkStatus();
      } else {
        setSyncFeedback('⚠️ Supabase me `contest_winners_settings` table nahi mili. Kripya pehle SQL script ko Supabase me RUN karein!');
      }
    } catch (err: any) {
      setSyncFeedback(`⚠️ Error: ${err?.message || 'Sync failed'}`);
    }
    setIsSyncing(false);
  };

  const handleSaveCustomCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim() || !customKey.trim()) return;

    saveSupabaseConfig(customUrl.trim(), customKey.trim());
    setConfig(getStoredSupabaseConfig());

    // Also update server config
    try {
      await fetch('/api/supabase/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: customUrl.trim(), anonKey: customKey.trim() }),
      });
    } catch (e) {
      console.warn('Server config error:', e);
    }

    setConfigSavedToast(true);
    setTimeout(() => setConfigSavedToast(false), 3000);
    await checkStatus();
  };

  if (!isOpen) return null;

  const currentProjectId = config.projectId || DEFAULT_SUPABASE_PROJECT_ID;
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${currentProjectId}/sql`;
  const tableEditorUrl = `https://supabase.com/dashboard/project/${currentProjectId}/editor`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs shrink-0">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">Supabase Database & Realtime Setup</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-white/25 text-white">
                  PostgreSQL
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                Project ID: <span className="font-mono font-bold">{currentProjectId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm text-slate-700 dark:text-slate-300">
          {/* Connection Status Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs sm:text-sm">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                Live Connection Status
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfigEdit(!showConfigEdit)}
                  className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-500 font-medium"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{showConfigEdit ? 'Hide Config' : 'Change Supabase ID/Key'}</span>
                </button>
                <button
                  onClick={checkStatus}
                  disabled={status.loading}
                  className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${status.loading ? 'animate-spin' : ''}`} />
                  Re-Check
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">API Endpoint</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate" title={config.url}>
                    {config.url.replace('https://', '')}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Table: leaderboard_users</span>
                <div className="flex items-center gap-1.5">
                  {status.tableExists ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Active ({status.rowCount} rows)
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {status.loading ? 'Checking...' : 'Table nahi mili'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Table: contest_winners</span>
                <div className="flex items-center gap-1.5">
                  {status.winnersTableExists ? (
                    <>
                      <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Active ({status.winnersCount} winners)
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {status.loading ? 'Checking...' : 'Run SQL'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Realtime Broadcast</span>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Live Channel Active
                  </span>
                </div>
              </div>
            </div>

            {status.error && (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60 font-mono">
                {status.error}
              </p>
            )}

            {syncFeedback && (
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60">
                {syncFeedback}
              </p>
            )}
          </div>

          {/* Optional: Edit Supabase Project ID & Anon Key */}
          {showConfigEdit && (
            <form onSubmit={handleSaveCustomCredentials} className="p-4 rounded-xl bg-slate-900 text-white border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" />
                  Apna Supabase Project Jodein (Custom Credentials)
                </span>
                <span className="text-[11px] text-slate-400">Settings local browser me save hoti hain</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Supabase Project URL:
                  </label>
                  <input
                    type="url"
                    required
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Supabase Anon Public Key:
                  </label>
                  <input
                    type="text"
                    required
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                {configSavedToast ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Naye Supabase Credentials Save ho gaye!
                  </span>
                ) : <span />}
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          )}

          {/* Explanation: Why table was not showing */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 space-y-2">
            <div className="flex items-start gap-2.5">
              <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                  Supabase Table Editor me Table kyun nahi dikh rahi thi?
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                  Supabase ek relational <strong>PostgreSQL</strong> database hai. Jab tak aap Supabase ke <strong>"SQL Editor"</strong> me jakar table banane ki query run nahi karte, tab tak Table Editor me <em>"No tables found"</em> dikhta hai. Humne neeche 1-Click ready SQL script diya hai jisme table bhi banegi aur <strong>28 contestants</strong> ka pura data bhi turant insert ho jayega!
                </p>
              </div>
            </div>
          </div>

          {/* 3 Step Action Guide */}
          <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-4">
            <h4 className="text-xs sm:text-sm font-black text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              3 Aasan Kadam me Supabase Table Banayein:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">Step 1</span>
                </div>
                <h5 className="font-bold text-xs text-white">SQL Code Copy Karein</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Neeche diye gaye <strong>"Copy SQL Schema"</strong> button par click karke poora SQL code copy karein.
                </p>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">Step 2</span>
                </div>
                <h5 className="font-bold text-xs text-white">Supabase SQL Editor Kholein</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Neeche diye link par click karein aur Supabase me jakar <strong>"New query"</strong> par click karein.
                </p>
                <a
                  href={sqlEditorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Supabase SQL</span>
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">Step 3</span>
                </div>
                <h5 className="font-bold text-xs text-white">Paste karke 'Run' Karein</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Query box me code paste karein aur green <strong>"Run"</strong> button dabayein. Table instant ban jayegi!
                </p>
                <a
                  href={tableEditorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Table Editor</span>
                </a>
              </div>
            </div>
          </div>

          {/* Realtime Mobile Sync Explanation */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/40 border border-cyan-500/30 space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              Admin se Edit karne par Sabhi Mobile me Live Update kaise hota hai?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-cyan-300 block mb-1">⚡ 1. Live SSE Push (&lt;50ms)</span>
                <p className="text-[11px] text-slate-400">
                  Admin jaise hi Direct ya Name edit karega, sabhi open mobiles par bina page reload kiye turant number badal jata hai.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-emerald-300 block mb-1">🔄 2. 1.5s Auto Probe</span>
                <p className="text-[11px] text-slate-400">
                  Mobile cellular networks (Jio/Airtel) par bhi har 1.5 second me update automatically sync hota hai.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-amber-300 block mb-1">☁️ 3. Supabase Cloud DB</span>
                <p className="text-[11px] text-slate-400">
                  Table <code>leaderboard_users</code> me row update hoti hai aur Supabase Realtime event trigger hota hai.
                </p>
              </div>
            </div>
          </div>

          {/* Complete SQL Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                Complete SQL Code (Table Creation + 28 Initial Contestants)
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <div className="relative rounded-xl bg-slate-900 text-slate-200 p-3.5 font-mono text-[11px] max-h-48 overflow-y-auto border border-slate-800 shadow-inner">
              <pre>{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Contestants: <span className="font-bold text-slate-900 dark:text-white font-mono">{users.length}</span> | Winners: <span className="font-bold text-amber-500 font-mono">{status.winnersCount}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePushWinnersToSupabase}
              disabled={isSyncing}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Sync Winners Table</span>
            </button>
            <button
              onClick={handlePushToSupabase}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : `Sync All Users`}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
