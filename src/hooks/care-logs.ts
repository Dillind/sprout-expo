import { logCareAction, undoCareAction, CareType } from '@/src/api/care-logs';
import { Plant } from '@/src/api/plants';
import {
    cancelCareNotification,
    requestNotificationPermissions,
    scheduleNextCareNotification,
} from '@/src/services/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { Alert } from 'react-native';

export function useLogCareAction() {
    const queryClient = useQueryClient();

    const undoMutation = useMutation({
        mutationFn: ({ plantId, logId, type }: { plantId: string; logId: string; type: CareType }) =>
            undoCareAction(plantId, logId),
        onSuccess: ({ plant }, { type }) => {
            queryClient.setQueryData(['plants'], (old: Plant[] | undefined) =>
                (old ?? []).map((p) => (p.id === plant.id ? plant : p))
            );
            // Cancel the notification that was just scheduled for this care type
            cancelCareNotification(plant.id, type);
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

            // Schedule next notification if reminders are enabled
            if (plant.remindersEnabled) {
                requestNotificationPermissions().then((granted) => {
                    if (granted) {
                        scheduleNextCareNotification(plant, log.type as CareType);
                    }
                });
            }

            // Show 5-second undo toast
            toast.success('Marked as done!', {
                duration: 5000,
                action: {
                    label: 'Undo',
                    onClick: () => undoMutation.mutate({ plantId: log.plantId, logId: log.id, type: log.type as CareType }),
                },
            });
        },
        onError: () => {
            Alert.alert('Error', 'Failed to mark task as done. Please try again.');
        },
    });
}
