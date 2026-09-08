import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let client = null;

const isValidSupabaseUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

const isValidSupabaseKey = (key) => {
  if (!key || typeof key !== 'string') return false;
  // Exclude placeholder example values
  if (key === 'your-supabase-anon-key' || key === 'your-supabase-service-role-key') return false;
  return key.trim().length > 10;
};

if (isValidSupabaseUrl(supabaseUrl) && isValidSupabaseKey(supabaseKey)) {
  try {
    client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.warn(`[Supabase] Initialization error: ${err.message}`);
    client = null;
  }
} else {
  console.warn('[Supabase] Warning: SUPABASE_URL or API keys are missing/unconfigured. QuickKart will operate in resilient in-memory fallback mode.');
}

export const supabase = client;

export const checkSupabaseConnection = async () => {
  if (!supabase) {
    console.warn('[Supabase] Operating without active Supabase PostgreSQL connection. Controllers will use resilient in-memory fallback data.');
    return false;
  }

  try {
    const { data, error } = await supabase.from('shops').select('id, shop_name').limit(1);
    if (error) throw error;
    console.log('[Supabase] ✅ Connected successfully to Supabase PostgreSQL database!');
    return true;
  } catch (err) {
    console.warn(`[Supabase Notice] Database ping: ${err.message}. Running in resilient mode.`);
    return false;
  }
};
