import { logCareAction, undoCareAction, CareType, PlantCareLog } from '@/src/api/care-logs';
import { Plant } from '@/src/api/plants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { Alert } from 'react-native';

export function useLogCareAction() {
    const queryClient = useQueryClient();

    const undoMutation = useMutation({
        mutationFn: ({ plantId, logId }: { plantId: string; logId: string }) =>
            undoCareAction(plantId, logId),
        onSuccess: ({ plant }) => {
            queryClient.setQueryData(['plants'], (old: Plant[] | undefined) =>
                (old ?? []).map((p) => (p.id === plant.id ? plant : p))
            );
        },
        onError: () => {
            Alert.alert('Error', 'Failed to undo. Please try again.');
        },
    });

    return useMutation({
        mutationFn: ({ plantId, type, doneAt }: { plantId: string; type: CareType; doneAt?: string }) =>
            logCareAction(plantId, { type, doneAt }),
        onSuccess: ({ log, plant }) => {
            // Update the plant in cache with new lastXAt value
            queryClient.setQueryData(['plants'], (old: Plant[] | undefined) =>
                (old ?? []).map((p) => (p.id === plant.id ? plant : p))
            );

            // Show 5-second undo toast
            toast.success('Marked as done!', {
                duration: 5000,
                action: {
                    label: 'Undo',
                    onClick: () => undoMutation.mutate({ plantId: log.plantId, logId: log.id }),
                },
            });
        },
        onError: () => {
            Alert.alert('Error', 'Failed to mark task as done. Please try again.');
        },
    });
}
