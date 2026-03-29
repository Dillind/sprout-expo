import supabase from '@/src/lib/supabase';
import { TablesInsert, TablesUpdate } from '@/src/types/db';

export namespace PlantService {
    export function list(userId: string) {
        return supabase
            .from('plants')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
    }

    export function get(id: string) {
        return supabase.from('plants').select('*').eq('id', id).single();
    }

    export function create(data: TablesInsert<'plants'>) {
        return supabase.from('plants').insert(data).select().single();
    }

    export function update(id: string, data: TablesUpdate<'plants'>) {
        return supabase.from('plants').update(data).eq('id', id).select().single();
    }

    export function remove(id: string) {
        return supabase.from('plants').delete().eq('id', id);
    }
}
