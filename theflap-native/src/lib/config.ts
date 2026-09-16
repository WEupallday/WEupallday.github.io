// TheFlap backend config — same Supabase project as the web app.
// The publishable key is a public client key (safe to ship).
export const SUPABASE_URL = 'https://zclappstgkjebltkdzlq.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_5W3tMe80Huoxr9srCiH-DA_E-y1uj0Q';
// Must match the web hash exactly: sha256('flapsalt' + name.toLowerCase() + '' + pass)
export const PASS_SALT = 'flapsalt';
