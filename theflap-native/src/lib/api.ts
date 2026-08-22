import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// DATA LAYER — verified against the live database schema.
//   flaps        : id, created_at, name, color, avatar_url, mood, body, pic_url, likes
//   flap_replies : id, flap_id, created_at, name, body
//   flap_notifs  : id, created_at, recipient, actor, kind, flap_id, excerpt, seen
//   flap_follows : follower, following, created_at
//   flap_feathers: name, balance, updated_at
//   flap_users   : name, avatar_url, handle, email, bio, verified, premium, violations, ...
//   (No DM/messages table exists yet — Messages degrade gracefully.)
// ---------------------------------------------------------------------------
export const TABLES = {
  users: 'flap_users',
  flaps: 'flaps',
  replies: 'flap_replies',
  follows: 'flap_follows',
  notifs: 'flap_notifs',
  owned: 'flap_store_owned',
  feathers: 'flap_feathers',
};

const FLAP_COLS = 'id, name, body, mood, created_at, likes, avatar_url, pic_url, color';

// ---- Profiles -------------------------------------------------------------
export type Profile = {
  name: string;
  avatar_url: string | null;
  bio?: string | null;
  verified?: boolean | null;
  premium?: boolean | null;
  handle?: string | null;
};

export async function getProfile(name: string): Promise<Profile | null> {
  const { data } = await supabase
    .from(TABLES.users)
    .select('name,avatar_url,bio,verified,premium,handle')
    .eq('name', name)
    .limit(1);
  return data && data.length ? (data[0] as Profile) : null;
}

export async function getUserFlaps(name: string, beforeIso?: string) {
  let q = supabase
    .from(TABLES.flaps)
    .select(FLAP_COLS)
    .eq('name', name)
    .order('created_at', { ascending: false })
    .limit(30);
  if (beforeIso) q = q.lt('created_at', beforeIso);
  const { data } = await q;
  return data || [];
}

export async function searchUsers(term: string) {
  const t = (term || '').trim();
  if (!t) return [];
  const { data } = await supabase
    .from(TABLES.users)
    .select('name,avatar_url,verified,premium')
    .ilike('name', `%${t}%`)
    .limit(30);
  return data || [];
}

// ---- Follows --------------------------------------------------------------
export async function getFollowState(me: string, target: string): Promise<boolean> {
  const { data } = await supabase
    .from(TABLES.follows)
    .select('follower')
    .eq('follower', me)
    .eq('following', target)
    .limit(1);
  return !!(data && data.length);
}

export async function getFollowerCount(target: string): Promise<number> {
  const { count } = await supabase
    .from(TABLES.follows)
    .select('*', { count: 'exact', head: true })
    .eq('following', target);
  return count || 0;
}

export async function setFollow(me: string, target: string, follow: boolean) {
  if (follow) {
    await supabase.from(TABLES.follows).insert({ follower: me, following: target });
  } else {
    await supabase.from(TABLES.follows).delete().eq('follower', me).eq('following', target);
  }
}

// ---- Replies --------------------------------------------------------------
export type Reply = {
  id: string | number;
  flap_id: string | number;
  name: string;
  body: string;
  created_at: string;
};

export async function getReplies(flapId: string | number): Promise<Reply[]> {
  const { data } = await supabase
    .from(TABLES.replies)
    .select('id, flap_id, name, body, created_at')
    .eq('flap_id', flapId)
    .order('created_at', { ascending: true })
    .limit(200);
  return (data || []) as Reply[];
}

export async function addReply(flapId: string | number, name: string, body: string) {
  const { error } = await supabase
    .from(TABLES.replies)
    .insert({ flap_id: flapId, name, body });
  if (error) throw new Error(error.message);
}

// ---- Notifications --------------------------------------------------------
export type Notif = {
  id: string | number;
  kind: string;
  excerpt: string | null;
  actor: string | null;
  flap_id: string | number | null;
  created_at: string;
  seen: boolean | null;
};

export async function getNotifs(me: string): Promise<Notif[]> {
  const { data } = await supabase
    .from(TABLES.notifs)
    .select('id, kind, excerpt, actor, flap_id, created_at, seen')
    .eq('recipient', me)
    .order('created_at', { ascending: false })
    .limit(60);
  return (data || []) as Notif[];
}

// ---- Messages (no backend table yet — degrade gracefully) -----------------
export type Message = {
  id: string | number;
  sender: string;
  recipient: string;
  body: string;
  created_at: string;
};

export async function getConversations(_me: string): Promise<{ partner: string; last: string; at: string }[]> {
  return [];
}

export async function getThread(_me: string, _partner: string): Promise<Message[]> {
  return [];
}

export async function sendMessage(_me: string, _partner: string, _body: string) {
  throw new Error('Direct messages are coming soon.');
}

// ---- Store ----------------------------------------------------------------
export async function getFeathers(me: string): Promise<number> {
  const { data } = await supabase
    .from(TABLES.feathers)
    .select('balance')
    .eq('name', me)
    .limit(1);
  return data && data.length ? Number((data[0] as any).balance) || 0 : 0;
}

export async function getOwnedItems(me: string): Promise<string[]> {
  const { data } = await supabase
    .from(TABLES.owned)
    .select('item')
    .eq('name', me);
  return (data || []).map((r: any) => r.item);
}
