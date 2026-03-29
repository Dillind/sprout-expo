import AppText from '@/src/components/core/AppText';
import MonthCalendar from '@/src/components/screens/calendar/MonthCalendar';
import TaskList from '@/src/components/screens/home/TaskList';
import AddTaskSheet from '@/src/components/sheets/add-task-sheet';
import { COLORS } from '@/src/constants/theme';
import { useLogCareAction } from '@/src/hooks/care-logs';
import { useCustomTasks, useDeleteCustomTask, useUpdateCustomTask } from '@/src/hooks/custom-tasks';
import { usePlants, useUpdatePlant } from '@/src/hooks/plants';
import { generateTasks, getTasksForDate, mergeTaskLists, Task } from '@/src/utils/tasks';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import dayjs, { Dayjs } from 'dayjs';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CalendarScreen() {
    const { plants, isLoading: plantsLoading, isError: plantsError } = usePlants();
    const [month, setMonth] = useState<Dayjs>(dayjs().startOf('month'));
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs().startOf('day'));
    const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
    const logCareAction = useLogCareAction();
    const updateCustomTask = useUpdateCustomTask();
    const deleteCustomTask = useDeleteCustomTask();
    const updatePlant = useUpdatePlant();
    const addTaskSheetRef = useRef<TrueSheet>(null);

    const rangeStart = useMemo(() => month.startOf('month'), [month]);
    const rangeEnd = useMemo(() => month.endOf('month'), [month]);

    const { customTasks, isLoading: customLoading } = useCustomTasks(rangeStart, rangeEnd);

    const autoTasks = useMemo(
        () => generateTasks(plants, rangeStart, rangeEnd),
        [plants, rangeStart, rangeEnd],
    );

    const allTasks = useMemo(
        () => mergeTaskLists(autoTasks, customTasks),
        [autoTasks, customTasks],
    );

    const selectedDateTasks = useMemo(
        () => getTasksForDate(allTasks, selectedDate),
        [allTasks, selectedDate],
    );

    const isToday = selectedDate.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
    const taskSectionTitle = isToday
        ? "Today's Tasks"
        : `Tasks for ${selectedDate.format('ddd, MMM D')}`;

    const isLoading = plantsLoading || customLoading;
    const isError = plantsError;

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
        <SafeAreaView edges={['top']} className="flex-1">
            {/* Header */}
            <View className="px-6 pb-4 bg-white">
                <AppText size="lg" font="bold">
                    Calendar
                </AppText>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : isError ? (
                <View className="flex-1 items-center justify-center px-6">
                    <AppText size="sm" color="gray" align="center">
                        Failed to load calendar data
                    </AppText>
                </View>
            ) : (
                <>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <MonthCalendar
                            month={month}
                            tasks={allTasks}
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                            onPrevMonth={() => setMonth((m) => m.subtract(1, 'month'))}
                            onNextMonth={() => setMonth((m) => m.add(1, 'month'))}
                        />
                        <View
                            style={{
                                height: 1,
                                backgroundColor: COLORS.border,
                                marginHorizontal: 16,
                                marginVertical: 8,
                            }}
                        />
                        <View className="px-4 pb-8">
                            <TaskList
                                title={taskSectionTitle}
                                tasks={selectedDateTasks}
                                onToggleTask={handleToggleTask}
                                completingTaskId={completingTaskId ?? undefined}
                                onOptions={handleTaskOptions}
                            />
                        </View>
                    </ScrollView>

                    {/* FAB */}
                    <Pressable
                        onPress={() => addTaskSheetRef.current?.present()}
                        className="absolute bottom-24 right-24 w-13 h-13 rounded-full bg-primary-dark items-center justify-center shadow-md shadow-primary-dark/35 elevation-6"
                    >
                        <Plus size={24} color="#fff" />
                    </Pressable>

                    <AddTaskSheet
                        sheetRef={addTaskSheetRef}
                        selectedDate={selectedDate}
                        handleDismiss={() => addTaskSheetRef.current?.dismiss()}
                    />
                </>
            )}
        </SafeAreaView>
    );
}
