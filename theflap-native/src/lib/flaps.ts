import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// SINGLE SOURCE OF TRUTH for the feed query.
// Verified against the live `flaps` table:
//   id, created_at, name, color, avatar_url, mood, body, pic_url, likes
// ---------------------------------------------------------------------------
const TABLE = 'flaps';
const COLS = 'id, name, body, mood, created_at, likes, avatar_url, pic_url, color';
const ORDER_COL = 'created_at';
const PAGE = 30;

export type Flap = {
  id: string | number;
  name: string;
  body: string;
  mood: string | null;
  created_at: string;
  likes: number | null;
  avatar_url?: string | null;
  pic_url?: string | null;
  color?: string | null;
};

// Cursor-based pagination on created_at keeps scroll smooth and avoids the
// offset "load glitch" the web app had.
export async function fetchFlaps(beforeIso?: string): Promise<Flap[]> {
  let q = supabase
    .from(TABLE)
    .select(COLS)
    .order(ORDER_COL, { ascending: false })
    .limit(PAGE);
  if (beforeIso) q = q.lt(ORDER_COL, beforeIso);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data || []) as Flap[];
}

export async function postFlap(name: string, body: string, mood: string): Promise<void> {
  const { error } = await supabase.from(TABLE).insert({ name, body, mood });
  if (error) throw new Error(error.message);
}
