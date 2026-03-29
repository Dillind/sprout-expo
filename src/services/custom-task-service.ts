import supabase from '@/src/lib/supabase';
import { TablesInsert, TablesUpdate } from '@/src/types/db';

export namespace CustomTaskService {
    export function list(userId: string, rangeStart?: string, rangeEnd?: string) {
        let query = supabase
            .from('custom_tasks')
            .select('*')
            .eq('user_id', userId)
            .order('due_date', { ascending: true });

        if (rangeStart && rangeEnd) {
            query = query.gte('due_date', rangeStart).lte('due_date', rangeEnd);
        }

        return query;
    }

    export function create(data: TablesInsert<'custom_tasks'>) {
        return supabase.from('custom_tasks').insert(data).select().single();
    }

    export function update(id: string, data: TablesUpdate<'custom_tasks'>) {
        return supabase.from('custom_tasks').update(data).eq('id', id).select().single();
    }

    export function remove(id: string) {
        return supabase.from('custom_tasks').delete().eq('id', id);
    }
}
