import supabase from '@/src/lib/supabase';
import { CareType } from '@/src/types/db';

export namespace CareLogService {
    export function create(plantId: string, userId: string, type: CareType, doneAt?: string) {
        return supabase.rpc('log_care_action', {
            p_plant_id: plantId,
            p_user_id: userId,
            p_type: type,
            p_done_at: doneAt ?? new Date().toISOString(),
        });
    }

    export function undo(logId: string, plantId: string, type: CareType) {
        return supabase.rpc('undo_care_action', {
            p_log_id: logId,
            p_plant_id: plantId,
            p_type: type,
        });
    }
}
