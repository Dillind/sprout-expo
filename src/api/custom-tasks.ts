import supabase from '@/src/lib/supabase';
import type { CareType } from './care-logs';

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

export type CustomTask = {
    id: string;
    userId: string;
    plantId: string | null;
    title: string;
    type: CareType;
    dueDate: string;
    completedAt: string | null;
    createdAt: string;
};

export type CreateCustomTaskPayload = {
    plantId?: string;
    title: string;
    type: CareType;
    dueDate: string; // ISO date string YYYY-MM-DD
};

export type UpdateCustomTaskPayload = {
    dueDate?: string;
    completedAt?: string | null;
};

export async function listCustomTasks(rangeStart: string, rangeEnd: string): Promise<CustomTask[]> {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams({ rangeStart, rangeEnd });
    const res = await fetch(`${API_BASE}/custom-tasks?${params}`, { headers });
    if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to fetch custom tasks';
        try {
            const err = JSON.parse(text);
            message = err.error ?? message;
        } catch {}
        throw new Error(message);
    }
    const data = await res.json();
    return data.customTasks;
}

export async function createCustomTask(payload: CreateCustomTaskPayload): Promise<CustomTask> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/custom-tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to create task';
        try {
            const err = JSON.parse(text);
            message = err.error ?? message;
        } catch {}
        throw new Error(message);
    }
    const data = await res.json();
    return data.customTask;
}

export async function updateCustomTask(
    id: string,
    payload: UpdateCustomTaskPayload,
): Promise<CustomTask> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/custom-tasks/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to update task';
        try {
            const err = JSON.parse(text);
            message = err.error ?? message;
        } catch {}
        throw new Error(message);
    }
    const data = await res.json();
    return data.customTask;
}

export async function deleteCustomTask(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/custom-tasks/${id}`, {
        method: 'DELETE',
        headers,
    });
    if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to delete task';
        try {
            const err = JSON.parse(text);
            message = err.error ?? message;
        } catch {}
        throw new Error(message);
    }
}
