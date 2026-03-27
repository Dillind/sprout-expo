import createClient from 'openapi-fetch';
import supabase from '@/src/lib/supabase';
import type { components, paths } from './generated';

export type Plant = components['schemas']['Plant'];
export type CreatePlantPayload = components['schemas']['CreatePlantRequest'];
export type UpdatePlantPayload = Partial<components['schemas']['CreatePlantRequest']>;

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
if (!API_BASE) throw new Error('EXPO_PUBLIC_API_URL is not set');

async function makeClient() {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    return createClient<paths>({
        baseUrl: `${API_BASE}/`,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
        },
    });
}

export async function listPlants(): Promise<Plant[]> {
    const client = await makeClient();
    const { data, error } = await client.GET('/plants');
    if (error) throw new Error('Failed to fetch plants');
    return data.plants ?? [];
}

export async function getPlant(id: string): Promise<Plant> {
    const client = await makeClient();
    const { data, error } = await client.GET('/plants/{id}', { params: { path: { id } } });
    if (error) throw new Error('Failed to fetch plant');
    return data.plant!;
}

export async function createPlant(payload: CreatePlantPayload): Promise<Plant> {
    const client = await makeClient();
    const { data, error } = await client.POST('/plants', { body: payload });
    if (error) throw new Error('Failed to create plant');
    return data.plant!;
}

export async function updatePlant(id: string, payload: UpdatePlantPayload): Promise<Plant> {
    const client = await makeClient();
    const { data, error } = await client.PATCH('/plants/{id}', {
        params: { path: { id } },
        body: payload as CreatePlantPayload,
    });
    if (error) throw new Error('Failed to update plant');
    return data.plant!;
}

export async function deletePlant(id: string): Promise<void> {
    const client = await makeClient();
    const { error } = await client.DELETE('/plants/{id}', { params: { path: { id } } });
    if (error) throw new Error('Failed to delete plant');
}
