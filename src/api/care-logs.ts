import supabase from '@/src/lib/supabase';
import { Plant } from './plants';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE) {
    throw new Error('EXPO_PUBLIC_API_URL is not set');
}

async function getAuthHeaders(): Promise<Record<string, string>> {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
    };
}

export type CareType = 'WATER' | 'FERTILIZE' | 'REPOT';

export type PlantCareLog = {
    id: string;
    plantId: string;
    userId: string;
    type: CareType;
    doneAt: string;
    createdAt: string;
};

export async function logCareAction(
    plantId: string,
    payload: { type: CareType; doneAt?: string }
): Promise<{ log: PlantCareLog; plant: Plant }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/plants/${plantId}/care-logs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to log care action';
        try {
            const err = JSON.parse(text);
            message = err.error ?? message;
        } catch {}
        throw new Error(message);
    }
    return res.json();
}

export async function undoCareAction(
    plantId: string,
    logId: string
): Promise<{ plant: Plant }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/plants/${plantId}/care-logs/${logId}`, {
        method: 'DELETE',
        headers,
    });
    if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to undo care action';
        try {
            const err = JSON.parse(text);
            message = err.error ?? message;
        } catch {}
        throw new Error(message);
    }
    return res.json();
}
