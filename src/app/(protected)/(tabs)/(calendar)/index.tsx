import AppText from '@/src/components/core/AppText';
import MonthCalendar from '@/src/components/screens/calendar/MonthCalendar';
import TaskList from '@/src/components/screens/home/TaskList';
import AddTaskSheet from '@/src/components/sheets/add-task-sheet';
import { COLORS } from '@/src/constants/theme';
import { useLogCareAction } from '@/src/hooks/care-logs';
import { useCustomTasks, useUpdateCustomTask } from '@/src/hooks/custom-tasks';
import { usePlants } from '@/src/hooks/plants';
import { generateTasks, getTasksForDate, mergeTaskLists, Task } from '@/src/utils/tasks';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import dayjs, { Dayjs } from 'dayjs';
import { Plus } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

export default function CalendarScreen() {
    const { plants, isLoading: plantsLoading, isError: plantsError } = usePlants();
    const [month, setMonth] = useState<Dayjs>(dayjs().startOf('month'));
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs().startOf('day'));
    const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
    const logCareAction = useLogCareAction();
    const updateCustomTask = useUpdateCustomTask();
    const addTaskSheetRef = useRef<TrueSheet>(null);

    const rangeStart = useMemo(() => dayjs().startOf('day'), []);
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

    const handleCompleteTask = (task: Task) => {
        if (task.source === 'custom') {
            if (task.customTaskId) {
                updateCustomTask.mutate({
                    id: task.customTaskId,
                    payload: { completedAt: new Date().toISOString() },
                });
            }
            return;
        }
        setCompletingTaskId(task.id);
        logCareAction.mutate(
            { plantId: task.plantId!, type: task.type },
            { onSettled: () => setCompletingTaskId(null) },
        );
    };

    return (
        <View className="flex-1" style={{ backgroundColor: COLORS.backgroundSecondary }}>
            {/* Header */}
            <View
                className="px-6 pt-14 pb-4 bg-white"
                style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border }}
            >
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
                                onCompleteTask={handleCompleteTask}
                                completingTaskId={completingTaskId ?? undefined}
                            />
                        </View>
                    </ScrollView>

                    {/* FAB */}
                    <Pressable
                        onPress={() => addTaskSheetRef.current?.present()}
                        style={{
                            position: 'absolute',
                            bottom: 24,
                            right: 24,
                            width: 52,
                            height: 52,
                            borderRadius: 26,
                            backgroundColor: COLORS.primaryDark,
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: COLORS.primaryDark,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.35,
                            shadowRadius: 8,
                            elevation: 6,
                        }}
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
        </View>
    );
}
