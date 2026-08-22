// TheFlap backend config — same Supabase project as the web app.
// The publishable key is a public client key (safe to ship).
export const SUPABASE_URL = 'https://zclappstgkjebltkdzlq.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_fn7Fzyx9B95U8FY_5cSO3Q_Mn43ce1H';
// Must match the web hash exactly: sha256('flapsalt' + name.toLowerCase() + '' + pass)
export const PASS_SALT = 'flapsalt';
