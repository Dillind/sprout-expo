import {
    createCustomTask,
    CreateCustomTaskPayload,
    CustomTask,
    deleteCustomTask,
    listCustomTasks,
    updateCustomTask,
    UpdateCustomTaskPayload,
} from '@/src/api/custom-tasks';
import { Task } from '@/src/utils/tasks';
import { CareType } from '@/src/api/care-logs';
import { Plant } from '@/src/api/plants';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dayjs } from 'dayjs';
import { Alert } from 'react-native';
import { toast } from 'sonner-native';

export function useCustomTasks(rangeStart: Dayjs, rangeEnd: Dayjs) {
    const queryClient = useQueryClient();
    const { data, isLoading, isError } = useQuery({
        queryKey: ['custom-tasks', rangeStart.format('YYYY-MM-DD'), rangeEnd.format('YYYY-MM-DD')],
        queryFn: () =>
            listCustomTasks(rangeStart.format('YYYY-MM-DD'), rangeEnd.format('YYYY-MM-DD')),
    });

    const plants: Plant[] = queryClient.getQueryData(['plants']) ?? [];

    const customTasks = (data ?? []).map((ct: CustomTask): Task => {
        const linkedPlant = ct.plantId ? plants.find((p) => p.id === ct.plantId) : null;
        return {
            id: `custom-${ct.id}`,
            plantId: ct.plantId,
            plantName: linkedPlant?.name ?? ct.title,
            plantPhotoUrl: null,
            type: ct.type as CareType,
            dueDate: ct.dueDate,
            isOverdue: false,
            source: 'custom',
            customTaskId: ct.id,
            title: ct.title,
        };
    });

    return { customTasks, isLoading, isError };
}

export function useCreateCustomTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateCustomTaskPayload) => createCustomTask(payload),
        onSuccess: () => {
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
        mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomTaskPayload }) =>
            updateCustomTask(id, payload),
        onSuccess: () => {
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
        mutationFn: (id: string) => deleteCustomTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['custom-tasks'] });
            toast.success('Task deleted.');
        },
        onError: () => {
            Alert.alert('Error', 'Failed to delete task. Please try again.');
        },
    });
}
