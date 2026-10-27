import { UpdateHistoryLog } from '../types';

export const HISTORY_STORAGE_KEY = 'smartpay360_update_history_v2';
const HISTORY_CHANNEL_NAME = 'smartpay360_history_channel_v2';

export function formatLogDate(date: Date = new Date()): string {
  try {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }); // e.g. "27 Oct 2026"
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export function formatLogTime(date: Date = new Date()): string {
  try {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }); // e.g. "10:25:40 AM"
  } catch {
    return new Date().toTimeString().slice(0, 8);
  }
}

// Initial sample logs so user sees what it looks like right away
export const INITIAL_HISTORY_LOGS: UpdateHistoryLog[] = [
  {
    id: 'log-seed-1',
    timestamp: Date.now() - 1000 * 60 * 12,
    dateFormatted: formatLogDate(new Date(Date.now() - 1000 * 60 * 12)),
    timeFormatted: formatLogTime(new Date(Date.now() - 1000 * 60 * 12)),
    userId: 'SPAY330606',
    userName: 'Babla Paul',
    actionType: 'ADD_DIRECT',
    actionLabel: 'Direct Added (+1)',
    changeSummary: 'Directs increased: 3 ➔ 4 | Tickets: 0',
    previousDirects: 3,
    newDirects: 4,
    previousTickets: 0,
    newTickets: 0,
  },
  {
    id: 'log-seed-2',
    timestamp: Date.now() - 1000 * 60 * 45,
    dateFormatted: formatLogDate(new Date(Date.now() - 1000 * 60 * 45)),
    timeFormatted: formatLogTime(new Date(Date.now() - 1000 * 60 * 45)),
    userId: 'SPAY447004',
    userName: 'Suman Dey',
    actionType: 'UPGRADE',
    actionLabel: 'Contest Upgrade',
    changeSummary: 'Directs: 0 ➔ 1 | Tickets: 0',
    previousDirects: 0,
    newDirects: 1,
    previousTickets: 0,
    newTickets: 0,
  },
];

export function getStoredHistoryLogs(): UpdateHistoryLog[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return INITIAL_HISTORY_LOGS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Error reading history logs:', err);
  }
  return INITIAL_HISTORY_LOGS;
}

export function saveStoredHistoryLogs(logs: UpdateHistoryLog[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(logs.slice(0, 200)));
  } catch (err) {
    console.error('Error saving history logs:', err);
  }
}

let historyChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    historyChannel = new BroadcastChannel(HISTORY_CHANNEL_NAME);
  }
} catch {
  // ignore
}

export function broadcastHistory(logs: UpdateHistoryLog[]): void {
  try {
    if (historyChannel) {
      historyChannel.postMessage({ type: 'HISTORY_UPDATED', logs });
    }
  } catch (e) {
    console.warn('[History] Broadcast failed:', e);
  }
}

export function subscribeToHistoryBroadcasts(callback: (logs: UpdateHistoryLog[]) => void): () => void {
  if (!historyChannel) return () => {};
  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type === 'HISTORY_UPDATED' && Array.isArray(event.data.logs)) {
      callback(event.data.logs);
    }
  };
  historyChannel.addEventListener('message', handler);
  return () => {
    if (historyChannel) {
      historyChannel.removeEventListener('message', handler);
    }
  };
}

export async function fetchHistoryFromApi(): Promise<UpdateHistoryLog[] | null> {
  try {
    const res = await fetch(`/api/history?_t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.history)) {
        return data.history;
      }
    }
  } catch (err) {
    console.warn('[API] Failed to fetch history from server:', err);
  }
  return null;
}

export async function postHistoryLogToApi(log: UpdateHistoryLog): Promise<UpdateHistoryLog[] | null> {
  try {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.history)) {
        return data.history;
      }
    }
  } catch (err) {
    console.warn('[API] Failed to post history log:', err);
  }
  return null;
}

export async function clearHistoryOnApi(): Promise<boolean> {
  try {
    const res = await fetch('/api/history/clear', { method: 'POST' });
    return res.ok;
  } catch (err) {
    console.warn('[API] Failed to clear history on server:', err);
    return false;
  }
}
