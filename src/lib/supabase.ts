import { createClient } from '@supabase/supabase-js';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'supabase-auth' });

const mmkvStorageAdapter = {
    getItem: (key: string): Promise<string | null> => {
        const value = storage.getString(key);
        return Promise.resolve(value ?? null);
    },
    setItem: (key: string, value: string): Promise<void> => {
        storage.set(key, value);
        return Promise.resolve();
    },
    removeItem: (key: string): Promise<void> => {
        storage.remove(key);
        return Promise.resolve();
    },
};

const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            storage: mmkvStorageAdapter,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    },
);

export default supabase;
