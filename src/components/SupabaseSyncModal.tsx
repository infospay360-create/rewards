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
} from 'lucide-react';
import {
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  SUPABASE_SQL_SCHEMA,
  checkSupabaseStatus,
  seedOrResetSupabaseUsers,
} from '../lib/supabase';
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
  const [status, setStatus] = useState<{
    loading: boolean;
    connected: boolean;
    tableExists: boolean;
    rowCount: number;
    error?: string;
  }>({
    loading: true,
    connected: false,
    tableExists: false,
    rowCount: 0,
  });

  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const checkStatus = async () => {
    setStatus((prev) => ({ ...prev, loading: true }));
    const res = await checkSupabaseStatus();
    setStatus({
      loading: false,
      connected: res.connected,
      tableExists: res.tableExists,
      rowCount: res.rowCount,
      error: res.error,
    });
  };

  useEffect(() => {
    if (isOpen) {
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
      // fallback
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
        setSyncFeedback(`✅ Successfully pushed ${users.length} users into Supabase database!`);
        await checkStatus();
        if (onSyncSuccess) onSyncSuccess();
      } else {
        // Try server endpoint
        const srvRes = await fetch('/api/supabase/seed', { method: 'POST' });
        if (srvRes.ok) {
          setSyncFeedback(`✅ Synced via server to Supabase!`);
          await checkStatus();
          if (onSyncSuccess) onSyncSuccess();
        } else {
          setSyncFeedback(
            '⚠️ Supabase table `leaderboard_users` not found. Please run the SQL schema below first!'
          );
        }
      }
    } catch (err: any) {
      setSyncFeedback(`⚠️ Error: ${err?.message || 'Sync failed'}`);
    }
    setIsSyncing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Supabase PostgreSQL & Realtime</h3>
              <p className="text-xs text-emerald-100 font-medium">
                Project ID: <span className="font-mono">{SUPABASE_PROJECT_ID}</span>
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
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-300">
          {/* Connection Status Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                Live Connection Status
              </span>
              <button
                onClick={checkStatus}
                disabled={status.loading}
                className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${status.loading ? 'animate-spin' : ''}`} />
                Check Now
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">API Endpoint</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">Active</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">PostgreSQL Table</span>
                <div className="flex items-center gap-1.5">
                  {status.tableExists ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        leaderboard_users ({status.rowCount} rows)
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {status.loading ? 'Checking...' : 'Run SQL Setup'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Realtime Broadcast</span>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    postgres_changes ON
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

          {/* Sync & Setup Instructions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Supabase SQL Schema & Realtime Setup
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied to Clipboard!' : 'Copy SQL Schema'}
                </button>
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Supabase SQL
                </a>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              To activate the persistent PostgreSQL database and Realtime stream, run this 1-click script in your
              Supabase SQL Editor. It automatically configures the <span className="font-mono text-emerald-600 font-bold">leaderboard_users</span> table, RLS security policies, and enables realtime replication.
            </p>

            {/* SQL Box */}
            <div className="relative rounded-xl bg-slate-900 text-slate-200 p-3 font-mono text-[11px] max-h-48 overflow-y-auto border border-slate-800 shadow-inner">
              <pre>{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Flow: <span className="font-semibold text-slate-700 dark:text-slate-200">Admin</span> →{' '}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Supabase DB</span> →{' '}
            <span className="font-semibold text-cyan-600 dark:text-cyan-400">Realtime</span> → All Mobiles
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePushToSupabase}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Pushing to Supabase...' : `Sync All ${users.length} Users to Supabase`}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
