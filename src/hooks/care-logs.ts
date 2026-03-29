import { CareLogService } from '@/src/services/care-log-service';
import {
    cancelCareNotification,
    requestNotificationPermissions,
    scheduleNextCareNotification,
} from '@/src/services/notifications';
import useUserStore from '@/src/stores/user-store';
import { CareType, Plant, PlantCareLog } from '@/src/types/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { toast } from 'sonner-native';

export function useLogCareAction() {
    const queryClient = useQueryClient();
    const userId = useUserStore((s) => s.user?.id);

    const undoMutation = useMutation({
        mutationFn: async ({
            logId,
            plantId,
            type,
        }: {
            logId: string;
            plantId: string;
            type: CareType;
        }) => {
            const { error } = await CareLogService.undo(logId, plantId, type);
            if (error) throw error;
            return { plantId, type };
        },
        onSuccess: ({ plantId, type }) => {
            queryClient.invalidateQueries({ queryKey: ['plants', userId] });
            cancelCareNotification(plantId, type);
        },
        onError: () => {
            Alert.alert('Error', 'Failed to undo. Please try again.');
        },
    });

    return useMutation({
        mutationFn: async ({
            plantId,
            type,
            doneAt,
        }: {
            plantId: string;
            type: CareType;
            doneAt?: string;
        }) => {
            const { data, error } = await CareLogService.create(
                plantId,
                userId!,
                type,
                doneAt,
            );
            if (error) throw error;
            return { log: (data as { log: PlantCareLog }).log, plantId, type, doneAt };
        },
        onSuccess: ({ log, plantId, type, doneAt }) => {
            const timestamp = doneAt ?? new Date().toISOString();
            const fieldMap: Record<CareType, keyof Plant> = {
                WATER: 'last_watered_at',
                FERTILIZE: 'last_fertilized_at',
                REPOT: 'last_repotted_at',
            };

            queryClient.setQueryData<Plant[]>(['plants', userId], (old) =>
                (old ?? []).map((p) =>
                    p.id === plantId ? { ...p, [fieldMap[type]]: timestamp } : p,
                ),
            );

            const plants: Plant[] = queryClient.getQueryData(['plants', userId]) ?? [];
            const plant = plants.find((p) => p.id === plantId);

            if (plant?.reminders_enabled) {
                requestNotificationPermissions().then((granted) => {
                    if (granted) scheduleNextCareNotification(plant, type);
                });
            }

            toast.success('Marked as done!', {
                duration: 5000,
                action: {
                    label: 'Undo',
                    onClick: () =>
                        undoMutation.mutate({ logId: log.id, plantId: log.plant_id, type: log.type }),
                },
            });
        },
        onError: () => {
            Alert.alert('Error', 'Failed to mark task as done. Please try again.');
        },
    });
}
