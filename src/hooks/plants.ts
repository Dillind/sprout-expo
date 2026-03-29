import { PlantService } from '@/src/services/plant-service';
import { cancelAllPlantNotifications } from '@/src/services/notifications';
import useUserStore from '@/src/stores/user-store';
import { Plant } from '@/src/types/db';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { toast } from 'sonner-native';

export function usePlants() {
    const userId = useUserStore((s) => s.user?.id);
    const { data, isLoading, isError, isRefetching, refetch } = useQuery({
        queryKey: ['plants', userId],
        queryFn: async () => {
            const { data, error } = await PlantService.list(userId!);
            if (error) throw error;
            return data;
        },
        enabled: !!userId,
    });
    return { plants: data ?? [], isLoading, isError, isRefetching, refetch };
}

export function useCreatePlant() {
    const queryClient = useQueryClient();
    const userId = useUserStore((s) => s.user?.id);
    return useMutation({
        mutationFn: async (payload: Omit<Plant, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await PlantService.create({ ...payload, user_id: userId! });
            if (error) throw error;
            return data;
        },
        onSuccess: (plant) => {
            queryClient.setQueryData<Plant[]>(['plants', userId], (old) =>
                old ? [plant, ...old] : [plant],
            );
            toast.success('Plant added!');
        },
        onError: () => {
            Alert.alert('Error', 'Failed to save your plant. Please try again.');
        },
    });
}

export function useUpdatePlant() {
    const queryClient = useQueryClient();
    const userId = useUserStore((s) => s.user?.id);
    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: Partial<Plant> }) => {
            const { data, error } = await PlantService.update(id, payload);
            if (error) throw error;
            return data;
        },
        onSuccess: (updatedPlant) => {
            queryClient.setQueryData<Plant[]>(['plants', userId], (old) =>
                (old ?? []).map((p) => (p.id === updatedPlant.id ? updatedPlant : p)),
            );
        },
        onError: () => {
            Alert.alert('Error', 'Failed to update plant. Please try again.');
        },
    });
}

export function useDeletePlant() {
    const queryClient = useQueryClient();
    const userId = useUserStore((s) => s.user?.id);
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await PlantService.remove(id);
            if (error) throw error;
            return id;
        },
        onSuccess: (id) => {
            queryClient.setQueryData<Plant[]>(['plants', userId], (old) =>
                (old ?? []).filter((p) => p.id !== id),
            );
            cancelAllPlantNotifications(id);
        },
        onError: () => {
            Alert.alert('Error', 'Failed to delete plant. Please try again.');
        },
    });
}
