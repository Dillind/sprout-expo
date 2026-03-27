import supabase from '@/src/lib/supabase';

// In dev, Expo dev server hosts the API routes
const API_BASE = process.env.EXPO_PUBLIC_API_URL;
console.log(API_BASE);

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

export type Plant = {
    id: string;
    userId: string;
    name: string;
    photoUrl: string | null;
    location: string;
    wateringDays: number;
    remindersEnabled: boolean;
    waterAmountMl: number | null;
    fertilizeDays: number | null;
    repotDays: number | null;
    lastWateredAt: string | null;
    lastFertilizedAt: string | null;
    lastRepottedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type CreatePlantPayload = {
    name: string;
    photoUrl?: string | null;
    location: string;
    wateringDays: number;
    remindersEnabled: boolean;
    waterAmountMl?: number | null;
    fertilizeDays?: number | null;
    repotDays?: number | null;
};

export async function createPlant(payload: CreatePlantPayload): Promise<Plant> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/plants`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });
    console.log(res);
    if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to create plant';
        try {
            const err = JSON.parse(text);
            message = err.error ?? message;
        } catch {
            console.error('[createPlant] Non-JSON error response:', text.slice(0, 500));
        }
        throw new Error(message);
    }
    const data = await res.json();
    return data.plant;
}

export type UpdatePlantPayload = {
    name?: string;
    photoUrl?: string | null;
    location?: string;
    wateringDays?: number;
    remindersEnabled?: boolean;
    waterAmountMl?: number | null;
    fertilizeDays?: number | null;
    repotDays?: number | null;
};

export async function listPlants(): Promise<Plant[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/plants`, { headers });
    if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to fetch plants';
        try {
            const err = JSON.parse(text);
            message = err.error ?? message;
        } catch {
            console.error('[listPlants] Non-JSON error response:', text.slice(0, 500));
        }
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
        } catch {
            console.error('[getPlant] Non-JSON error response:', text.slice(0, 500));
        }
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
        } catch {
            console.error('[updatePlant] Non-JSON error response:', text.slice(0, 500));
        }
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
        } catch {
            console.error('[deletePlant] Non-JSON error response:', text.slice(0, 500));
        }
        throw new Error(message);
    }
}
