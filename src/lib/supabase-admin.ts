import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase admin environment variables: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
}

// Server-side only — uses service role key (never expose to client)
const supabaseAdmin = createClient(url, serviceRoleKey);

export default supabaseAdmin;
