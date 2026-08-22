import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { PASS_SALT } from './config';

const SESSION_KEY = 'theflap.session.name';

export type FlapUser = {
  name: string;
  email: string | null;
  avatar_url: string | null;
  verified?: boolean | null;
  premium?: boolean | null;
};

// Exactly matches the web hash: sha256('flapsalt' + name.toLowerCase() + '' + pass)
export async function hashPassword(name: string, pass: string): Promise<string> {
  const input = PASS_SALT + name.toLowerCase() + '' + pass;
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);
}

// Disposable-domain blocklist mirrors the web signup guard.
const DISPOSABLE = [
  'mailinator.com', 'guerrillamail.com', 'sharklasers.com', '10minutemail.com',
  'tempmail.com', 'temp-mail.org', 'yopmail.com', 'trashmail.com', 'getnada.com',
  'dispostable.com', 'maildrop.cc', 'fakeinbox.com', 'throwawaymail.com',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(raw: string): string | null {
  const email = (raw || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return 'Please enter a valid email address.';
  const domain = email.split('@')[1] || '';
  if (DISPOSABLE.includes(domain)) return 'Please use a real, non-temporary email.';
  return null;
}

// Look up a user by display name OR @handle (web accepts either).
async function findUser(login: string): Promise<any | null> {
  const key = (login || '').trim();
  const { data } = await supabase
    .from('flap_users')
    .select('name,email,avatar_url,verified,premium,pass_hash')
    .or(`name.eq.${key},name.eq.${key.toLowerCase()}`)
    .limit(1);
  return data && data.length ? data[0] : null;
}

export async function login(loginName: string, pass: string): Promise<FlapUser> {
  const user = await findUser(loginName);
  if (!user) throw new Error('No account with that name.');
  const h = await hashPassword(user.name, pass);
  if (h !== user.pass_hash) throw new Error('Wrong password.');
  const clean: FlapUser = {
    name: user.name,
    email: user.email ?? null,
    avatar_url: user.avatar_url ?? null,
    verified: user.verified ?? null,
    premium: user.premium ?? null,
  };
  await AsyncStorage.setItem(SESSION_KEY, clean.name);
  return clean;
}

export async function signup(name: string, email: string, pass: string): Promise<FlapUser> {
  const cleanName = (name || '').trim();
  if (cleanName.length < 2) throw new Error('Pick a name with at least 2 characters.');
  const emailErr = validateEmail(email);
  if (emailErr) throw new Error(emailErr);
  if ((pass || '').length < 4) throw new Error('Password must be at least 4 characters.');

  // Uniqueness check (case-insensitive) — the DB also enforces this.
  const existing = await findUser(cleanName);
  if (existing) throw new Error('That name is taken.');

  const pass_hash = await hashPassword(cleanName, pass);
  const emailClean = email.trim().toLowerCase();
  const { error } = await supabase.from('flap_users').insert({
    name: cleanName,
    email: emailClean,
    pass_hash,
  });
  if (error) {
    if ((error.message || '').toLowerCase().includes('duplicate')) {
      throw new Error('That name or email is already in use.');
    }
    throw new Error(error.message || 'Could not create the account.');
  }
  const user: FlapUser = { name: cleanName, email: emailClean, avatar_url: null };
  await AsyncStorage.setItem(SESSION_KEY, cleanName);
  return user;
}

export async function restoreSession(): Promise<FlapUser | null> {
  const name = await AsyncStorage.getItem(SESSION_KEY);
  if (!name) return null;
  const { data } = await supabase
    .from('flap_users')
    .select('name,email,avatar_url,verified,premium')
    .eq('name', name)
    .limit(1);
  if (!data || !data.length) return null;
  const u = data[0];
  return {
    name: u.name,
    email: u.email ?? null,
    avatar_url: u.avatar_url ?? null,
    verified: u.verified ?? null,
    premium: u.premium ?? null,
  };
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
  try { await supabase.auth.signOut(); } catch {}
}
