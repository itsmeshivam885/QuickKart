import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const checkSupabaseConnection = async () => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.warn('[Supabase] Warning: SUPABASE_URL or SUPABASE_KEY missing in .env');
      return false;
    }
    const { data, error } = await supabase.from('shops').select('id, shop_name').limit(1);
    if (error) throw error;
    console.log('[Supabase] ✅ Connected successfully to Supabase PostgreSQL database!');
    return true;
  } catch (err) {
    console.error(`[Supabase Error] ${err.message}`);
    return false;
  }
};
