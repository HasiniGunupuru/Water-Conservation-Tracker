const { createClient } = require('@supabase/supabase-js');
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
if (!url || !key || url.includes('YOUR-PROJECT-REF') || key.includes('YOUR_SUPABASE')) {
  throw new Error('Set SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env before starting the server.');
}
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
module.exports = supabase;
