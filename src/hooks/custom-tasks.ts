import { CustomTaskService } from '@/src/services/custom-task-service';
import useUserStore from '@/src/stores/user-store';
import { CareType, CustomTask } from '@/src/types/db';
import { Task } from '@/src/utils/tasks';
import { Plant } from '@/src/types/db';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dayjs } from 'dayjs';
import { Alert } from 'react-native';
import { toast } from 'sonner-native';

export function useCustomTasks(rangeStart: Dayjs, rangeEnd: Dayjs) {
    const userId = useUserStore((s) => s.user?.id);
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['custom-tasks', rangeStart.format('YYYY-MM-DD'), rangeEnd.format('YYYY-MM-DD')],
        queryFn: async () => {
            const { data, error } = await CustomTaskService.list(
                userId!,
                rangeStart.format('YYYY-MM-DD'),
                rangeEnd.format('YYYY-MM-DD'),
            );
            if (error) throw error;
            return data;
        },
        enabled: !!userId,
    });

    const plants: Plant[] = queryClient.getQueryData(['plants', userId]) ?? [];

    const customTasks = (data ?? []).map((ct: CustomTask): Task => {
        const linkedPlant = ct.plant_id ? plants.find((p) => p.id === ct.plant_id) : null;
        return {
            id: `custom-${ct.id}`,
            plantId: ct.plant_id,
            plantName: linkedPlant?.name ?? ct.title,
            plantPhotoUrl: null,
            type: ct.type as CareType,
            dueDate: ct.due_date,
            isOverdue: false,
            source: 'custom',
            customTaskId: ct.id,
            title: ct.title,
            completedAt: ct.completed_at,
        };
    });

    return { customTasks, isLoading, isError };
}

export function useCreateCustomTask() {
    const queryClient = useQueryClient();
    const userId = useUserStore((s) => s.user?.id);
    return useMutation({
        mutationFn: async (payload: {
            title: string;
            type: CareType;
            due_date: string;
            plant_id?: string | null;
        }) => {
            const { data, error } = await CustomTaskService.create({
                ...payload,
                user_id: userId!,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (newTask) => {
            queryClient.setQueriesData<CustomTask[]>(
                { queryKey: ['custom-tasks'] },
                (old) => (old ? [...old, newTask] : [newTask]),
            );
            queryClient.invalidateQueries({ queryKey: ['custom-tasks'] });
            toast.success('Task added!');
        },
        onError: () => {
            Alert.alert('Error', 'Failed to add task. Please try again.');
        },
    });
}

export function useUpdateCustomTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            payload,
        }: {
            id: string;
            payload: Partial<CustomTask>;
        }) => {
            const { data, error } = await CustomTaskService.update(id, payload);
            if (error) throw error;
            return data;
        },
        onSuccess: (updatedTask) => {
            queryClient.setQueriesData<CustomTask[]>(
                { queryKey: ['custom-tasks'] },
                (old) => old?.map((t) => (t.id === updatedTask.id ? updatedTask : t)) ?? [],
            );
            queryClient.invalidateQueries({ queryKey: ['custom-tasks'] });
        },
        onError: () => {
            Alert.alert('Error', 'Failed to update task. Please try again.');
        },
    });
}

export function useDeleteCustomTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await CustomTaskService.remove(id);
            if (error) throw error;
            return id;
        },
        onSuccess: (id) => {
            queryClient.setQueriesData<CustomTask[]>(
                { queryKey: ['custom-tasks'] },
                (old) => old?.filter((t) => t.id !== id) ?? [],
            );
            queryClient.invalidateQueries({ queryKey: ['custom-tasks'] });
            toast.success('Task deleted.');
        },
        onError: () => {
            Alert.alert('Error', 'Failed to delete task. Please try again.');
        },
    });
}
