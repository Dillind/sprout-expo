import { createClient } from '@supabase/supabase-js';

// Server-side only — uses service role key (never expose to client)
const supabaseAdmin = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default supabaseAdmin;
