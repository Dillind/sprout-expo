import supabase from '@/src/lib/supabase';

// In dev, Expo dev server hosts the API routes
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8081/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
    };
}

export type Plant = {
    id: string;
    userId: string;
    name: string;
    photoUrl: string | null;
    location: string;
    wateringDays: number;
    remindersEnabled: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CreatePlantPayload = {
    name: string;
    photoUrl?: string | null;
    location: string;
    wateringDays: number;
    remindersEnabled: boolean;
};

export async function createPlant(payload: CreatePlantPayload): Promise<Plant> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/plants`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed to create plant');
    }
    const data = await res.json();
    return data.plant;
}

export async function listPlants(): Promise<Plant[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/plants`, { headers });
    if (!res.ok) throw new Error('Failed to fetch plants');
    const data = await res.json();
    return data.plants;
}
