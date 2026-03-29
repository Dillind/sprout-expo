import AppText from '@/src/components/core/AppText';
import WeekStrip from '@/src/components/screens/home/WeekStrip';
import TaskList from '@/src/components/screens/home/TaskList';
import { COLORS } from '@/src/constants/theme';
import { useLogCareAction } from '@/src/hooks/care-logs';
import { useCustomTasks, useUpdateCustomTask, useDeleteCustomTask } from '@/src/hooks/custom-tasks';
import { usePlants, useUpdatePlant } from '@/src/hooks/plants';
import { generateTasks, getTasksForDate, mergeTaskLists, Task } from '@/src/utils/tasks';
import dayjs, { Dayjs } from 'dayjs';
import { router } from 'expo-router';
import { Cloud } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';

function WeatherPlaceholder() {
    return (
        <View className="mx-4 mb-4 rounded-2xl p-5" style={{ backgroundColor: COLORS.primaryDark }}>
            <View className="flex-row items-center gap-2 mb-2">
                <Cloud size={18} color="rgba(255,255,255,0.8)" />
                <AppText size="xs" color="white" style={{ opacity: 0.8 }}>
                    Weather
                </AppText>
            </View>
            <AppText size="sm" font="bold" color="white">
                Weather coming soon
            </AppText>
            <AppText size="xs" color="white" style={{ opacity: 0.7 }} className="mt-1">
                We&apos;ll show local conditions to help you care for your plants.
            </AppText>
        </View>
    );
}

export default function HomeScreen() {
    const { plants, isLoading, isError, refetch, isRefetching } = usePlants();
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
    const logCareAction = useLogCareAction();
    const updateCustomTask = useUpdateCustomTask();
    const deleteCustomTask = useDeleteCustomTask();
    const updatePlant = useUpdatePlant();

    // Generate tasks for today + 30 days ahead
    const rangeEnd = useMemo(() => dayjs().add(30, 'day'), []);

    const { customTasks } = useCustomTasks(dayjs().startOf('day'), rangeEnd);

    const allTasks = useMemo(
        () => mergeTaskLists(generateTasks(plants, dayjs().startOf('day'), rangeEnd), customTasks),
        [plants, rangeEnd, customTasks],
    );

    // Tasks for selected date, overdue first
    const todayTasks = useMemo(() => {
        const tasks = getTasksForDate(allTasks, selectedDate);
        return [...tasks].sort((a, b) => (b.isOverdue ? 1 : 0) - (a.isOverdue ? 1 : 0));
    }, [allTasks, selectedDate]);

    const isToday = selectedDate.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
    const sectionTitle = isToday
        ? "Today's Tasks"
        : `Tasks for ${selectedDate.format('ddd, MMM D')}`;

    const handleToggleTask = (task: Task) => {
        if (task.source === 'custom' && task.customTaskId) {
            updateCustomTask.mutate({
                id: task.customTaskId,
                payload: { completed_at: task.completedAt ? null : new Date().toISOString() },
            });
            return;
        }
        // Auto tasks: one-way complete only
        if (!task.completedAt) {
            setCompletingTaskId(task.id);
            logCareAction.mutate(
                { plantId: task.plantId!, type: task.type },
                { onSettled: () => setCompletingTaskId(null) },
            );
        }
    };

    const handleTaskOptions = (task: Task) => {
        const isCustom = task.source === 'custom';

        const pushTask = (days: number) => {
            const newDate = dayjs(task.dueDate).add(days, 'day');
            if (isCustom && task.customTaskId) {
                updateCustomTask.mutate({
                    id: task.customTaskId,
                    payload: { due_date: newDate.format('YYYY-MM-DD') },
                });
            } else if (task.plantId) {
                const plant = plants.find((p) => p.id === task.plantId);
                if (!plant) return;
                const intervalDays =
                    task.type === 'WATER'
                        ? plant.watering_days
                        : task.type === 'FERTILIZE'
                          ? plant.fertilize_days
                          : plant.repot_days;
                if (!intervalDays) return;
                const newLastAt = newDate.subtract(intervalDays, 'day').toISOString();
                const fieldMap: Record<string, string> = {
                    WATER: 'last_watered_at',
                    FERTILIZE: 'last_fertilized_at',
                    REPOT: 'last_repotted_at',
                };
                updatePlant.mutate({
                    id: task.plantId,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    payload: { [fieldMap[task.type]]: newLastAt } as any,
                });
            }
        };

        const reschedule = () => {
            Alert.alert('Reschedule task', 'Push to:', [
                { text: 'Tomorrow', onPress: () => pushTask(1) },
                { text: 'In 3 days', onPress: () => pushTask(3) },
                { text: 'Next week', onPress: () => pushTask(7) },
                { text: 'Cancel', style: 'cancel' },
            ]);
        };

        const buttons: Parameters<typeof Alert.alert>[2] = [
            { text: 'Reschedule', onPress: reschedule },
        ];

        if (!isCustom && task.plantId) {
            buttons.push({
                text: 'Edit plant schedule',
                onPress: () => router.push(`/(protected)/add-plant?plantId=${task.plantId}`),
            });
        }

        if (isCustom && task.customTaskId) {
            buttons.push({
                text: 'Delete task',
                style: 'destructive',
                onPress: () => deleteCustomTask.mutate(task.customTaskId!),
            });
        }

        buttons.push({ text: 'Cancel', style: 'cancel' });

        Alert.alert('Task options', task.plantName, buttons);
    };

    return (
        <View className="flex-1" style={{ backgroundColor: COLORS.backgroundSecondary }}>
            {/* Header */}
            <View
                className="flex-row items-center justify-between px-6 pt-14 pb-4 bg-white"
                style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border }}
            >
                <AppText size="lg" font="bold">
                    My Garden
                </AppText>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : isError ? (
                <View className="flex-1 items-center justify-center px-6">
                    <AppText size="sm" color="gray" align="center" className="mb-4">
                        Failed to load garden data
                    </AppText>
                    <Pressable onPress={() => refetch()}>
                        <AppText size="sm" font="semiBold" style={{ color: COLORS.primaryDark }}>
                            Try again
                        </AppText>
                    </Pressable>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <WeatherPlaceholder />

                    {/* This Week */}
                    <View className="bg-white mb-4 pt-2 pb-1" style={{ borderRadius: 0 }}>
                        <View className="flex-row items-center justify-between px-4 mb-1">
                            <AppText size="sm" font="bold">
                                This Week
                            </AppText>
                            <Pressable
                                onPress={() => router.push('/(protected)/(tabs)/(calendar)')}
                            >
                                <AppText size="xs" style={{ color: COLORS.primaryDark }}>
                                    View Calendar
                                </AppText>
                            </Pressable>
                        </View>
                        <WeekStrip
                            selectedDate={selectedDate}
                            tasks={allTasks}
                            onSelectDate={setSelectedDate}
                        />
                    </View>

                    {/* Tasks */}
                    <View className="px-4">
                        <TaskList
                            title={sectionTitle}
                            tasks={todayTasks}
                            onToggleTask={handleToggleTask}
                            completingTaskId={completingTaskId ?? undefined}
                            onOptions={handleTaskOptions}
                        />
                    </View>
                </ScrollView>
            )}
        </View>
    );
}
