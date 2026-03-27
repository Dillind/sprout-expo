import { createPlant, CreatePlantPayload, listPlants, Plant, updatePlant, UpdatePlantPayload } from '@/src/api/plants';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { toast } from 'sonner-native';

export function usePlants() {
    const { data, isLoading, isError, isRefetching, refetch } = useQuery({
        queryKey: ['plants'],
        queryFn: listPlants,
    });
    return { plants: data ?? [], isLoading, isError, isRefetching, refetch };
}

export function useCreatePlant() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreatePlantPayload) => createPlant(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plants'] });
            toast.success('Plant added!');
        },
        onError: () => {
            Alert.alert('Error', 'Failed to save your plant. Please try again.');
        },
    });
}

export function useUpdatePlant() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdatePlantPayload }) =>
            updatePlant(id, payload),
        onSuccess: (updatedPlant) => {
            queryClient.setQueryData(['plants'], (old: Plant[] | undefined) =>
                (old ?? []).map((p) => (p.id === updatedPlant.id ? updatedPlant : p))
            );
        },
        onError: () => {
            Alert.alert('Error', 'Failed to update plant. Please try again.');
        },
    });
}
