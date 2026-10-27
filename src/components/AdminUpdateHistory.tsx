import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  User,
  PlusCircle,
  MinusCircle,
  Sparkles,
  Edit,
  Trash2,
  RotateCcw,
  Search,
  Download,
  Filter,
  Trash,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { UpdateHistoryLog } from '../types';

interface AdminUpdateHistoryProps {
  logs: UpdateHistoryLog[];
  onClearHistory: () => void;
  showToast?: (msg: string) => void;
}

export const AdminUpdateHistory: React.FC<AdminUpdateHistoryProps> = ({
  logs,
  onClearHistory,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter logs by search and action type
  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      log.userId.toLowerCase().includes(q) ||
      (log.userName && log.userName.toLowerCase().includes(q)) ||
      log.changeSummary.toLowerCase().includes(q);

    if (!matchQuery) return false;

    if (filterAction === 'ALL') return true;
    if (filterAction === 'ADD') return log.actionType === 'ADD_DIRECT' || log.actionType === 'NEW_USER';
    if (filterAction === 'MINUS') return log.actionType === 'MINUS_DIRECT';
    if (filterAction === 'EDIT') return log.actionType === 'EDIT' || log.actionType === 'UPGRADE';
    return true;
  });

  const handleExportCSV = () => {
    if (logs.length === 0) {
      if (showToast) showToast('⚠️ No history records to export');
      return;
    }

    const headers = ['Date', 'Time', 'User ID', 'Name', 'Action', 'Change Summary', 'Timestamp'];
    const rows = logs.map((l) => [
      `"${l.dateFormatted}"`,
      `"${l.timeFormatted}"`,
      `"${l.userId}"`,
      `"${(l.userName || '').replace(/"/g, '""')}"`,
      `"${l.actionLabel || l.actionType}"`,
      `"${(l.changeSummary || '').replace(/"/g, '""')}"`,
      l.timestamp,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SmartPay360_Update_History_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    if (showToast) showToast('📥 Exported update history to CSV successfully!');
  };

  const getActionBadge = (log: UpdateHistoryLog) => {
    switch (log.actionType) {
      case 'ADD_DIRECT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <PlusCircle className="w-3 h-3 text-emerald-400" />
            <span>{log.actionLabel || '+1 Direct'}</span>
          </span>
        );
      case 'MINUS_DIRECT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <MinusCircle className="w-3 h-3 text-rose-400" />
            <span>{log.actionLabel || '-1 Direct'}</span>
          </span>
        );
      case 'NEW_USER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{log.actionLabel || 'New Contestant'}</span>
          </span>
        );
      case 'EDIT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
            <Edit className="w-3 h-3 text-sky-400" />
            <span>{log.actionLabel || 'Edited'}</span>
          </span>
        );
      case 'DELETE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-950 text-red-400 border border-red-800">
            <Trash2 className="w-3 h-3" />
            <span>Removed</span>
          </span>
        );
      case 'RESET':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <CheckCircle2 className="w-3 h-3" />
            <span>{log.actionLabel || 'Updated'}</span>
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Update History (Live Records)
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/40 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  LIVE
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
                  {logs.length} logs
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Har update ka exact <strong className="text-amber-300">Date</strong>, <strong className="text-amber-300">Time</strong>, aur <strong className="text-amber-300">User Name</strong> live record hota hai.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Export & Clear */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-500/40 transition cursor-pointer"
            title="Download CSV Backup of History"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV</span>
          </button>

          {!showClearConfirm ? (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 transition cursor-pointer"
              title="Clear history logs"
            >
              <Trash className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-rose-950 border border-rose-600 rounded-xl p-1 animate-in fade-in">
              <span className="text-[11px] text-rose-200 px-1 font-bold">Pakka clear karein?</span>
              <button
                type="button"
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-2 py-0.5 rounded bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
              >
                Haan
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Nahi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 my-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by User ID, Name, or Changes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Action Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <button
            type="button"
            onClick={() => setFilterAction('ALL')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
              filterAction === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Sabhi ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterAction('ADD')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
              filterAction === 'ADD'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <PlusCircle className="w-3 h-3 text-emerald-400" />
            <span>Add / New</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterAction('MINUS')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
              filterAction === 'MINUS'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <MinusCircle className="w-3 h-3 text-rose-400" />
            <span>Minus (-1)</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterAction('EDIT')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
              filterAction === 'EDIT'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Edit className="w-3 h-3 text-sky-400" />
            <span>Edits</span>
          </button>
        </div>
      </div>

      {/* History Log Table */}
      {filteredLogs.length === 0 ? (
        <div className="py-12 text-center rounded-xl bg-slate-950/60 border border-dashed border-slate-800">
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-bold text-slate-300">Koi update record nahi mila</p>
          <p className="text-xs text-slate-500 mt-1">
            Admin panel se kisi bhi contestant ka direct add ya change karenge toh uska record yahan live dikhai dega.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Date & Time</span>
                  </div>
                </th>
                <th className="py-3 px-3.5">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Contestant (Name & ID)</span>
                  </div>
                </th>
                <th className="py-3 px-3.5">Action</th>
                <th className="py-3 px-3.5">Live Change Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Date & Time */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                        <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{log.dateFormatted}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[11px] text-amber-300/90 mt-0.5">
                        <Clock className="w-3 h-3 text-amber-400/80 shrink-0" />
                        <span>{log.timeFormatted}</span>
                      </div>
                    </div>
                  </td>

                  {/* Contestant Name & ID */}
                  <td className="py-3 px-3.5">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {log.userName || 'Unnamed Contestant'}
                      </span>
                      <span className="font-mono text-[11px] text-amber-400 font-bold">
                        {log.userId}
                      </span>
                    </div>
                  </td>

                  {/* Action Badge */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    {getActionBadge(log)}
                  </td>

                  {/* Change Summary */}
                  <td className="py-3 px-3.5">
                    <div className="font-mono text-xs font-medium text-slate-200 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 inline-block">
                      {log.changeSummary}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
