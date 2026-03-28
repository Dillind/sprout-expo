import supabase from '@/src/lib/supabase';
import type { components } from './generated';

export type Plant = components['schemas']['Plant'];
export type CreatePlantPayload = components['schemas']['CreatePlantRequest'];
export type UpdatePlantPayload = components['schemas']['UpdatePlantRequest'];

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
if (!API_BASE) throw new Error('EXPO_PUBLIC_API_URL is not set');

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

export async function listPlants(): Promise<Plant[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/plants`, { headers });
    if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to fetch plants';
        try {
            const err = JSON.parse(text);
            message = err.error ?? message;
        } catch {}
        throw new Error(message);
    }
    const data = await res.json();
    return data.plants;
}

export async function getPlant(id: string): Promise<Plant> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/plants/${id}`, { headers });
    if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to fetch plant';
        try {
            const err = JSON.parse(text);
            message = err.error ?? message;
        } catch {}
        throw new Error(message);
    }
    const data = await res.json();
    return data.plant;
}

export async function createPlant(payload: CreatePlantPayload): Promise<Plant> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/plants`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to create plant';
        try {
            const err = JSON.parse(text);
            message = err.error ?? message;
        } catch {}
        throw new Error(message);
    }
    const data = await res.json();
    return data.plant;
}

export async function updatePlant(id: string, payload: UpdatePlantPayload): Promise<Plant> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/plants/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to update plant';
        try {
            const err = JSON.parse(text);
            message = err.error ?? message;
        } catch {}
        throw new Error(message);
    }
    const data = await res.json();
    return data.plant;
}

export async function deletePlant(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/plants/${id}`, {
        method: 'DELETE',
        headers,
    });
    if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to delete plant';
        try {
            const err = JSON.parse(text);
            message = err.error ?? message;
        } catch {}
        throw new Error(message);
    }
}
