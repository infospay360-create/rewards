import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LeaderboardUser, ThemeSettings, WinnersSettings, RewardWinner } from '../types';
import { sortLeaderboard } from '../utils/leaderboardUtils';
import { INITIAL_LEADERBOARD_USERS } from '../data/initialData';

export const DEFAULT_SUPABASE_PROJECT_ID = 'nqkwsnkyvqktykgoijos';
export const DEFAULT_SUPABASE_URL = `https://${DEFAULT_SUPABASE_PROJECT_ID}.supabase.co`;
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_MT7oSxtBkkEl8zmGxwrFlA_8cdzCT2W';

export function getStoredSupabaseConfig() {
  try {
    const customUrl = localStorage.getItem('spay_supabase_url');
    const customKey = localStorage.getItem('spay_supabase_anon_key');
    const customId = localStorage.getItem('spay_supabase_project_id');
    return {
      projectId: customId || import.meta.env.VITE_SUPABASE_PROJECT_ID || DEFAULT_SUPABASE_PROJECT_ID,
      url: customUrl || import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
      anonKey: customKey || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
    };
  } catch {
    return {
      projectId: DEFAULT_SUPABASE_PROJECT_ID,
      url: DEFAULT_SUPABASE_URL,
      anonKey: DEFAULT_SUPABASE_ANON_KEY,
    };
  }
}

export function saveSupabaseConfig(url: string, anonKey: string, projectId?: string) {
  try {
    localStorage.setItem('spay_supabase_url', url.trim());
    localStorage.setItem('spay_supabase_anon_key', anonKey.trim());
    if (projectId) {
      localStorage.setItem('spay_supabase_project_id', projectId.trim());
    } else {
      const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
      if (match && match[1]) {
        localStorage.setItem('spay_supabase_project_id', match[1]);
      }
    }
    // Reset instance to force re-initialization with new credentials
    supabaseInstance = null;
    return true;
  } catch {
    return false;
  }
}

export const SUPABASE_PROJECT_ID = DEFAULT_SUPABASE_PROJECT_ID;
export const SUPABASE_URL = DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = DEFAULT_SUPABASE_ANON_KEY;

export const SUPABASE_TABLE = 'leaderboard_users';
export const SUPABASE_WINNERS_TABLE = 'contest_winners_settings';

export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- SMARTPAY360 - SUPABASE POSTGRESQL FULL SCHEMA
-- 1. Leaderboard Users Table (All Contestants)
-- 2. Contest Winners Settings (Live Rewards & Show/Hide Switch)
-- 3. Individual Winners Table (Claim status & positions)
--
-- Is script ko copy karke Supabase SQL Editor me paste karein aur RUN button dabayein:
-- https://supabase.com/dashboard/project/${DEFAULT_SUPABASE_PROJECT_ID}/sql
-- ==========================================

-- 1. Leaderboard Users Table
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

-- Fast Ranking & Sorting Index
CREATE INDEX IF NOT EXISTS idx_leaderboard_users_ranking 
ON public.leaderboard_users (ticket_count DESC, direct_count DESC, updated_at ASC);

-- 2. Contest Winners Settings Table (Admin Live Show/Hide + All Rewards Data)
CREATE TABLE IF NOT EXISTS public.contest_winners_settings (
    id TEXT PRIMARY KEY DEFAULT 'current_winners',
    is_visible BOOLEAN NOT NULL DEFAULT true,
    title TEXT NOT NULL,
    announcement_subtitle TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    winners JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 3. Contest Winners Individual Records Table
CREATE TABLE IF NOT EXISTS public.contest_winners (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    prize_category TEXT NOT NULL,
    rank_or_position TEXT NOT NULL,
    prize_title TEXT NOT NULL,
    prize_value TEXT NOT NULL,
    announced_date TEXT,
    claim_status TEXT DEFAULT 'VERIFIED',
    badge_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Row Level Security (RLS) Enable Karein
ALTER TABLE public.leaderboard_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_winners_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_winners ENABLE ROW LEVEL SECURITY;

-- 5. Public Access Policies for leaderboard_users (Live read & write)
DROP POLICY IF EXISTS "Allow public read access" ON public.leaderboard_users;
CREATE POLICY "Allow public read access"
ON public.leaderboard_users FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON public.leaderboard_users;
CREATE POLICY "Allow public insert"
ON public.leaderboard_users FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON public.leaderboard_users;
CREATE POLICY "Allow public update"
ON public.leaderboard_users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete" ON public.leaderboard_users;
CREATE POLICY "Allow public delete"
ON public.leaderboard_users FOR DELETE TO anon, authenticated USING (true);

-- 6. Public Access Policies for contest_winners_settings (Admin Show/Hide & Edit Live)
DROP POLICY IF EXISTS "Allow public read winners" ON public.contest_winners_settings;
CREATE POLICY "Allow public read winners"
ON public.contest_winners_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public insert winners" ON public.contest_winners_settings;
CREATE POLICY "Allow public insert winners"
ON public.contest_winners_settings FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update winners" ON public.contest_winners_settings;
CREATE POLICY "Allow public update winners"
ON public.contest_winners_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete winners" ON public.contest_winners_settings;
CREATE POLICY "Allow public delete winners"
ON public.contest_winners_settings FOR DELETE TO anon, authenticated USING (true);

-- 7. Public Access Policies for individual contest_winners
DROP POLICY IF EXISTS "Allow public read ind winners" ON public.contest_winners;
CREATE POLICY "Allow public read ind winners"
ON public.contest_winners FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public write ind winners" ON public.contest_winners;
CREATE POLICY "Allow public write ind winners"
ON public.contest_winners FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 8. Realtime Live Replication Enable Karein (Sabhi Mobile Devices me Live Push)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'leaderboard_users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard_users;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'contest_winners_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.contest_winners_settings;
  END IF;
END $$;

-- 9. Initial Rewards Winners Data Insert/Update Karein
INSERT INTO public.contest_winners_settings (id, is_visible, title, announcement_subtitle, last_updated, winners)
VALUES (
  'current_winners',
  true,
  '🏆 SmartPay 360 Official Rewards & Winners Announcement 🎊',
  'Live list of official contest prize winners (Top 10 Cash Rewards & Lucky Draw Prizes)',
  NOW(),
  '[
    {"id":"win-1","userId":"SPAY330606","name":"Babla Paul","prizeCategory":"cash_top10","rankOrPosition":1,"prizeTitle":"🥇 1st Prize: ₹51,000 Guaranteed Cash","prizeValue":"₹51,000 Cash","announcedDate":"29 Oct 2026","claimStatus":"VERIFIED","badgeNote":"Grand Champion 🏆"},
    {"id":"win-2","userId":"SPAY447004","name":"Suman Dey","prizeCategory":"cash_top10","rankOrPosition":2,"prizeTitle":"🥈 2nd Prize: ₹31,000 Guaranteed Cash","prizeValue":"₹31,000 Cash","announcedDate":"29 Oct 2026","claimStatus":"VERIFIED","badgeNote":"Rank 2 Star 🥈"},
    {"id":"win-3","userId":"SPAY411819","name":"Leader One","prizeCategory":"cash_top10","rankOrPosition":3,"prizeTitle":"🥉 3rd Prize: ₹21,000 Guaranteed Cash","prizeValue":"₹21,000 Cash","announcedDate":"29 Oct 2026","claimStatus":"DISBURSED","badgeNote":"Rank 3 Winner 🥉"},
    {"id":"win-4","userId":"SPAY512990","name":"Rajesh Sharma","prizeCategory":"lucky_draw","rankOrPosition":"Lucky Draw #1","prizeTitle":"🎁 Lucky Draw: Android 5G Smartphone","prizeValue":"Android Smartphone","announcedDate":"29 Oct 2026","claimStatus":"PENDING","badgeNote":"Lucky Draw 📱"},
    {"id":"win-5","userId":"SPAY620112","name":"Pooja Verma","prizeCategory":"lucky_draw","rankOrPosition":"Lucky Draw #2","prizeTitle":"🎁 Lucky Draw: 32\\" HD Smart TV","prizeValue":"32\\" Smart LED TV","announcedDate":"29 Oct 2026","claimStatus":"VERIFIED","badgeNote":"Mega Gift 📺"}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  is_visible = EXCLUDED.is_visible,
  title = EXCLUDED.title,
  announcement_subtitle = EXCLUDED.announcement_subtitle,
  winners = EXCLUDED.winners,
  last_updated = NOW();

-- 10. Initial 28 Contestants ko Supabase me Insert karein
INSERT INTO public.leaderboard_users (id, user_id, name, direct_count, ticket_count, custom_ticket_bonus)
VALUES
('1', 'SPAY670109', 'RADHESHYAM DAS', 14, 2, 0),
('2', 'SPAY185598', 'Gautam Paul', 6, 1, 0),
('3', 'SPAY751646', 'Shilankar Rudra Paul', 6, 1, 0),
('4', 'SPAY836406', 'Dipankar Majumder', 6, 1, 0),
('5', 'SPAY411819', 'Uttam Dey', 5, 1, 0),
('6', 'SPAY941425', 'ANITA PAUL', 5, 1, 0),
('7', 'SPAY350275', 'Sukanta Paul', 4, 0, 0),
('8', 'SPAY550099', 'Satyajit Das', 4, 0, 0),
('9', 'SPAY900542', 'Minakshi Biswas', 4, 0, 0),
('10', 'SPAY371265', 'Santanu Bhowmik', 3, 0, 0),
('11', 'SPAY157577', 'Smart Leader 11', 2, 0, 0),
('12', 'SPAY196510', 'Smart Leader 12', 2, 0, 0),
('13', 'SPAY600393', 'Smart Leader 13', 2, 0, 0),
('14', 'SPAY689007', 'Smart Leader 14', 2, 0, 0),
('15', 'SPAY128186', 'Smart Leader 15', 1, 0, 0),
('16', 'SPAY130127', 'Smart Leader 16', 1, 0, 0),
('17', 'SPAY140034', 'Smart Leader 17', 1, 0, 0),
('18', 'SPAY181083', 'Smart Leader 18', 1, 0, 0),
('19', 'SPAY247700', 'Smart Leader 19', 1, 0, 0),
('20', 'SPAY455246', 'Smart Leader 20', 1, 0, 0),
('21', 'SPAY464168', 'Smart Leader 21', 1, 0, 0),
('22', 'SPAY475634', 'Smart Leader 22', 1, 0, 0),
('23', 'SPAY548824', 'Smart Leader 23', 1, 0, 0),
('24', 'SPAY601803', 'Smart Leader 24', 1, 0, 0),
('25', 'SPAY634529', 'Smart Leader 25', 1, 0, 0),
('26', 'SPAY636086', 'Smart Leader 26', 1, 0, 0),
('27', 'SPAY715983', 'Smart Leader 27', 1, 0, 0),
('28', 'SPAY749973', 'Smart Leader 28', 1, 0, 0)
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  direct_count = EXCLUDED.direct_count,
  ticket_count = EXCLUDED.ticket_count,
  updated_at = NOW();
`;

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const config = getStoredSupabaseConfig();
    supabaseInstance = createClient(config.url, config.anonKey, {
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

// Health check to verify Supabase status (both leaderboard_users & contest_winners_settings)
export async function checkSupabaseStatus(): Promise<{
  connected: boolean;
  tableExists: boolean;
  rowCount: number;
  winnersTableExists: boolean;
  winnersCount: number;
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
        winnersTableExists: false,
        winnersCount: 0,
        error: error.message,
      };
    }

    let winnersTableExists = false;
    let winnersCount = 0;
    try {
      const { data: winData, error: winErr } = await supabase
        .from(SUPABASE_WINNERS_TABLE)
        .select('*')
        .eq('id', 'current_winners')
        .maybeSingle();

      if (!winErr && winData) {
        winnersTableExists = true;
        winnersCount = Array.isArray(winData.winners) ? winData.winners.length : 0;
      } else if (!winErr && !winData) {
        winnersTableExists = true;
        winnersCount = 0;
      }
    } catch {
      winnersTableExists = false;
    }

    return {
      connected: true,
      tableExists: true,
      rowCount: count ?? (data ? data.length : 0),
      winnersTableExists,
      winnersCount,
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      rowCount: 0,
      winnersTableExists: false,
      winnersCount: 0,
      error: err?.message || 'Connection failed',
    };
  }
}

// ==========================================
// CONTEST WINNERS SUPABASE INTEGRATION
// ==========================================

// Fetch winners settings directly from Supabase
export async function fetchWinnersFromSupabase(): Promise<WinnersSettings | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(SUPABASE_WINNERS_TABLE)
      .select('*')
      .eq('id', 'current_winners')
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] Fetch winners error:', error.message);
      return null;
    }

    if (data) {
      return {
        isVisible: typeof data.is_visible === 'boolean' ? data.is_visible : true,
        title: data.title || '🏆 SmartPay 360 Official Rewards & Winners Announcement 🎊',
        announcementSubtitle: data.announcement_subtitle || '',
        lastUpdated: data.last_updated || new Date().toISOString(),
        winners: Array.isArray(data.winners) ? (data.winners as RewardWinner[]) : [],
      };
    }
  } catch (err) {
    console.warn('[Supabase] Exception during fetch winners:', err);
  }
  return null;
}

// Upsert winners settings into Supabase
export async function upsertWinnersInSupabase(settings: WinnersSettings): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const row = {
      id: 'current_winners',
      is_visible: settings.isVisible,
      title: settings.title,
      announcement_subtitle: settings.announcementSubtitle || '',
      last_updated: settings.lastUpdated || new Date().toISOString(),
      winners: settings.winners || [],
    };
    const { error } = await supabase
      .from(SUPABASE_WINNERS_TABLE)
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Upsert winners error:', error.message);
      return false;
    }

    // Also sync individual contest_winners table for reference
    if (Array.isArray(settings.winners) && settings.winners.length > 0) {
      try {
        const indRows = settings.winners.map((w) => ({
          id: w.id || `win-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          user_id: String(w.userId || '').toUpperCase(),
          name: w.name,
          prize_category: w.prizeCategory,
          rank_or_position: String(w.rankOrPosition),
          prize_title: w.prizeTitle,
          prize_value: w.prizeValue,
          announced_date: w.announcedDate || new Date().toISOString().split('T')[0],
          claim_status: w.claimStatus || 'VERIFIED',
          badge_note: w.badgeNote || '',
          updated_at: new Date().toISOString(),
        }));
        await supabase
          .from('contest_winners')
          .upsert(indRows, { onConflict: 'id' });
      } catch (indErr) {
        console.warn('[Supabase] Individual winners sync note:', indErr);
      }
    }

    return true;
  } catch (err) {
    console.warn('[Supabase] Exception during upsert winners:', err);
    return false;
  }
}

// Subscribe to Supabase Realtime changes on contest_winners_settings
export function subscribeToSupabaseWinners(
  onUpdate: (settings: WinnersSettings) => void
): () => void {
  try {
    const supabase = getSupabaseClient();
    const channelName = `realtime-winners-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: SUPABASE_WINNERS_TABLE,
        },
        async (payload) => {
          console.log('[Supabase Realtime Winners] Event received:', payload.eventType);
          const fresh = await fetchWinnersFromSupabase();
          if (fresh) {
            onUpdate(fresh);
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Supabase Realtime Winners] Status: ${status}`);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase Realtime Winners] Subscribe exception:', err);
    return () => {};
  }
}

// Global Supabase Realtime Broadcast channel for all devices across India
let activeThemeChannel: any = null;

export function subscribeToSupabaseTheme(
  onThemeChange: (theme: ThemeSettings) => void
): () => void {
  try {
    const supabase = getSupabaseClient();
    const channelName = 'smartpay360-live-theme-channel';
    activeThemeChannel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'theme_update' }, (message) => {
        if (message && message.payload && message.payload.bgBaseColor) {
          onThemeChange(message.payload as ThemeSettings);
        }
      })
      .subscribe();

    return () => {
      if (activeThemeChannel) {
        supabase.removeChannel(activeThemeChannel);
        activeThemeChannel = null;
      }
    };
  } catch (err) {
    console.warn('[Supabase Realtime Theme] Subscribe error:', err);
    return () => {};
  }
}

export function broadcastThemeToSupabase(theme: ThemeSettings): void {
  try {
    const supabase = getSupabaseClient();
    const channelName = 'smartpay360-live-theme-channel';
    // If channel is already subscribed, send immediately
    if (activeThemeChannel) {
      activeThemeChannel.send({
        type: 'broadcast',
        event: 'theme_update',
        payload: theme,
      });
      return;
    }

    const channel = supabase.channel(channelName);
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'theme_update',
          payload: theme,
        });
      }
    });
  } catch (err) {
    console.warn('[Supabase Realtime Theme] Broadcast error:', err);
  }
}
