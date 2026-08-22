import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// SINGLE SOURCE OF TRUTH for the feed query.
// If a column name differs in the live DB, change it HERE only.
// Confirm against: Supabase -> Table editor -> `flaps`.
// ---------------------------------------------------------------------------
const TABLE = 'flaps';
const COLS = 'id, name, text, mood, created_at, likes';
const ORDER_COL = 'created_at';
const PAGE = 30;

export type Flap = {
  id: string | number;
  name: string;
  text: string;
  mood: string | null;
  created_at: string;
  likes: number | null;
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

export async function postFlap(name: string, text: string, mood: string): Promise<void> {
  const { error } = await supabase.from(TABLE).insert({ name, text, mood });
  if (error) throw new Error(error.message);
}
