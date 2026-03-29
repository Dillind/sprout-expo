import supabase from '@/src/lib/supabase';
import { TablesUpdate } from '@/src/types/db';

export namespace UserService {
    export function get(id: string) {
        return supabase.from('users').select('*').eq('id', id).single();
    }

    export function update(id: string, data: TablesUpdate<'users'>) {
        return supabase.from('users').update(data).eq('id', id).select().single();
    }
}
