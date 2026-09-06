import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LeaderboardUser } from '../types';
import { sortLeaderboard } from '../utils/leaderboardUtils';
import { INITIAL_LEADERBOARD_USERS } from '../data/initialData';

export const SUPABASE_PROJECT_ID = 'nqkwsnkyvqktykgoijos';
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MT7oSxtBkkEl8zmGxwrFlA_8cdzCT2W';

export const SUPABASE_TABLE = 'leaderboard_users';

export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- SMARTPAY360 LEADERBOARD - SUPABASE POSTGRESQL SCHEMA
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql
-- ==========================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.leaderboard_users (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    direct_count INTEGER NOT NULL DEFAULT 0,
    ticket_count INTEGER NOT NULL DEFAULT 0,
    custom_ticket_bonus INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Index for ultra-fast sorting
CREATE INDEX IF NOT EXISTS idx_leaderboard_users_ranking 
ON public.leaderboard_users (ticket_count DESC, direct_count DESC, updated_at ASC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.leaderboard_users ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (Allow Read, Insert, Update, Delete for public web app)
DROP POLICY IF EXISTS "Allow public read access" ON public.leaderboard_users;
CREATE POLICY "Allow public read access"
ON public.leaderboard_users
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON public.leaderboard_users;
CREATE POLICY "Allow public insert"
ON public.leaderboard_users
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON public.leaderboard_users;
CREATE POLICY "Allow public update"
ON public.leaderboard_users
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete" ON public.leaderboard_users;
CREATE POLICY "Allow public delete"
ON public.leaderboard_users
FOR DELETE
TO anon, authenticated
USING (true);

-- 5. Enable Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard_users;
`;

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      auth: {
        persistSession: false,
      },
    });
  }
  return supabaseInstance;
}

// Convert Supabase database row to LeaderboardUser format
export function mapRowToLeaderboardUser(row: any): LeaderboardUser {
  return {
    id: String(row.id || row.user_id),
    userId: String(row.user_id || row.userId || '').toUpperCase(),
    name: String(row.name || `Leader ${String(row.user_id || '').slice(-4)}`),
    directCount: Number(row.direct_count ?? row.directCount ?? 0),
    ticketCount: Number(row.ticket_count ?? row.ticketCount ?? 0),
    customTicketBonus: Number(row.custom_ticket_bonus ?? row.customTicketBonus ?? 0),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

// Convert LeaderboardUser format to Supabase database row
export function mapLeaderboardUserToRow(user: LeaderboardUser): any {
  return {
    id: user.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    user_id: user.userId.trim().toUpperCase(),
    name: user.name.trim(),
    direct_count: Math.max(0, Number(user.directCount) || 0),
    ticket_count: Math.max(0, Number(user.ticketCount) || 0),
    custom_ticket_bonus: Math.max(0, Number(user.customTicketBonus) || 0),
    created_at: user.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// Fetch users directly from Supabase
export async function fetchUsersFromSupabase(): Promise<LeaderboardUser[] | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(SUPABASE_TABLE)
      .select('*')
      .order('ticket_count', { ascending: false })
      .order('direct_count', { ascending: false });

    if (error) {
      // If table does not exist or permission denied
      console.warn('[Supabase] Fetch error:', error.message);
      return null;
    }

    if (Array.isArray(data)) {
      const users = data.map(mapRowToLeaderboardUser);
      return sortLeaderboard(users);
    }
  } catch (err) {
    console.warn('[Supabase] Exception during fetch:', err);
  }
  return null;
}

// Upsert a single user into Supabase
export async function upsertUserInSupabase(user: LeaderboardUser): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const row = mapLeaderboardUserToRow(user);
    const { error } = await supabase
      .from(SUPABASE_TABLE)
      .upsert(row, { onConflict: 'user_id' });

    if (error) {
      console.warn('[Supabase] Upsert user error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Exception during upsert:', err);
    return false;
  }
}

// Batch upsert multiple users (e.g. for initial seed or reset)
export async function seedOrResetSupabaseUsers(
  usersToSeed = INITIAL_LEADERBOARD_USERS
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const rows = usersToSeed.map(mapLeaderboardUserToRow);
    const { error } = await supabase
      .from(SUPABASE_TABLE)
      .upsert(rows, { onConflict: 'user_id' });

    if (error) {
      console.warn('[Supabase] Seed/reset error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Exception during seed/reset:', err);
    return false;
  }
}

// Delete a user from Supabase
export async function deleteUserFromSupabase(userIdOrId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const cleanId = userIdOrId.trim().toUpperCase();
    const { error } = await supabase
      .from(SUPABASE_TABLE)
      .delete()
      .or(`user_id.eq.${cleanId},id.eq.${userIdOrId}`);

    if (error) {
      console.warn('[Supabase] Delete error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Exception during delete:', err);
    return false;
  }
}

// Subscribe to Supabase Realtime changes
export function subscribeToSupabaseRealtime(
  onDataChange: (users: LeaderboardUser[]) => void
): () => void {
  const supabase = getSupabaseClient();
  const channelName = `realtime-leaderboard-${Date.now()}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: SUPABASE_TABLE,
      },
      async (payload) => {
        console.log('[Supabase Realtime] Event received:', payload.eventType);
        // On any change (INSERT, UPDATE, DELETE), immediately fetch latest authoritative list
        const freshUsers = await fetchUsersFromSupabase();
        if (freshUsers && freshUsers.length > 0) {
          onDataChange(freshUsers);
        }
      }
    )
    .subscribe((status) => {
      console.log(`[Supabase Realtime] Status: ${status}`);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

// Health check to verify Supabase status
export async function checkSupabaseStatus(): Promise<{
  connected: boolean;
  tableExists: boolean;
  rowCount: number;
  error?: string;
}> {
  try {
    const supabase = getSupabaseClient();
    const { data, error, count } = await supabase
      .from(SUPABASE_TABLE)
      .select('*', { count: 'exact', head: false })
      .limit(1);

    if (error) {
      return {
        connected: true, // Server responded
        tableExists: false,
        rowCount: 0,
        error: error.message,
      };
    }

    return {
      connected: true,
      tableExists: true,
      rowCount: count ?? (data ? data.length : 0),
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      rowCount: 0,
      error: err?.message || 'Connection failed',
    };
  }
}
