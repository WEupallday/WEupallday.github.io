import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { Flap } from './flaps';

// Unit-separator used by the website to encode a ReFlap body:
//   RF␟<reflapperName>␟<originalId>␟<originalBody>
export const RF = '␟';

export function parseReflap(body: string): { isReflap: boolean; by?: string; origId?: string; origBody?: string } {
  if (!body || body.slice(0, 3) !== 'RF' + RF) return { isReflap: false };
  const parts = body.split(RF);
  return { isReflap: true, by: parts[1], origId: parts[2], origBody: parts.slice(3).join(RF) };
}

// ---- Likes ("Flap This!") -------------------------------------------------
export async function likeFlap(id: string | number, current: number): Promise<number> {
  const next = (current || 0) + 1;
  try {
    await supabase.from('flaps').update({ likes: next }).eq('id', id);
  } catch {}
  return next;
}

// ---- ReFlap ---------------------------------------------------------------
export async function reflap(me: string, flap: Flap): Promise<void> {
  const origBody = parseReflap(flap.body).isReflap ? parseReflap(flap.body).origBody! : flap.body;
  const body = ['RF', me, String(flap.id), origBody].join(RF);
  const { error } = await supabase.from('flaps').insert({ name: me, body, mood: flap.mood || null });
  if (error) throw new Error(error.message);
}

// ---- Report ---------------------------------------------------------------
export async function reportFlap(flap: Flap, reporter: string, reason = 'Reported from app'): Promise<void> {
  // flap_reports is insert-only for the anon role; ignore any shape mismatch.
  try {
    await supabase.from('flap_reports').insert({
      flap_id: flap.id, target: flap.name, reporter, reason,
    });
  } catch {}
}

// ---- Block (stored on-device; feed filters against it) --------------------
const BLOCK_KEY = 'flap.blocked';
export async function getBlocked(): Promise<string[]> {
  try { return JSON.parse((await AsyncStorage.getItem(BLOCK_KEY)) || '[]'); } catch { return []; }
}
export async function blockUser(name: string): Promise<void> {
  const list = await getBlocked();
  if (!list.includes(name)) { list.push(name); await AsyncStorage.setItem(BLOCK_KEY, JSON.stringify(list)); }
}

// ---- Translate (on-device, free endpoint) ---------------------------------
export async function translate(text: string, to = 'en'): Promise<string> {
  try {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' +
      to + '&dt=t&q=' + encodeURIComponent(text);
    const r = await fetch(url);
    const j = await r.json();
    return (j[0] || []).map((s: any) => s[0]).join('');
  } catch {
    return text;
  }
}

// ---- Poll of the Day ------------------------------------------------------
export type Poll = { id: number; question: string; opts: string[] };

function daySeed(): number {
  const d = new Date();
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86400000);
}

export async function getDailyPoll(): Promise<Poll | null> {
  const { data } = await supabase
    .from('flap_poll_bank')
    .select('id, question, opts')
    .eq('active', true)
    .order('id', { ascending: true });
  if (!data || !data.length) return null;
  const pick = data[daySeed() % data.length];
  return { id: pick.id, question: pick.question, opts: pick.opts as string[] };
}

export async function getPollResults(pollId: number): Promise<number[]> {
  const { data } = await supabase.from('flap_poll').select('choice').eq('poll_id', pollId);
  const counts: number[] = [];
  (data || []).forEach((r: any) => {
    const c = r.choice;
    if (c >= 0) counts[c] = (counts[c] || 0) + 1;
  });
  return counts;
}

export async function votePoll(pollId: number, choice: number, name: string): Promise<void> {
  try {
    await supabase.from('flap_poll').insert({ poll_id: pollId, choice, name });
  } catch {}
}

const VOTED_KEY = 'flap.pollVoted.';
export async function getMyVote(pollId: number): Promise<number | null> {
  try { const v = await AsyncStorage.getItem(VOTED_KEY + pollId); return v == null ? null : Number(v); } catch { return null; }
}
export async function setMyVote(pollId: number, choice: number): Promise<void> {
  try { await AsyncStorage.setItem(VOTED_KEY + pollId, String(choice)); } catch {}
}
