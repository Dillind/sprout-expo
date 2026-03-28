import AppText from '@/src/components/core/AppText';
import MonthCalendar from '@/src/components/screens/calendar/MonthCalendar';
import TaskList from '@/src/components/screens/home/TaskList';
import { COLORS } from '@/src/constants/theme';
import { useLogCareAction } from '@/src/hooks/care-logs';
import { usePlants } from '@/src/hooks/plants';
import { generateTasks, getTasksForDate, Task } from '@/src/utils/tasks';
import dayjs, { Dayjs } from 'dayjs';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

export default function CalendarScreen() {
    const { plants, isLoading, isError } = usePlants();
    const [month, setMonth] = useState<Dayjs>(dayjs().startOf('month'));
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs().startOf('day'));
    const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
    const logCareAction = useLogCareAction();

    // Tasks from today onwards until end of displayed month
    const rangeStart = useMemo(() => dayjs().startOf('day'), []);
    const rangeEnd = useMemo(() => month.endOf('month'), [month]);

    const allTasks = useMemo(
        () => generateTasks(plants, rangeStart, rangeEnd),
        [plants, rangeStart, rangeEnd],
    );

    const selectedDateTasks = useMemo(() => {
        const tasks = getTasksForDate(allTasks, selectedDate);
        return [...tasks].sort((a, b) => (b.isOverdue ? 1 : 0) - (a.isOverdue ? 1 : 0));
    }, [allTasks, selectedDate]);

    const isToday = selectedDate.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
    const taskSectionTitle = isToday
        ? "Today's Tasks"
        : `Tasks for ${selectedDate.format('ddd, MMM D')}`;

    const handleCompleteTask = (task: Task) => {
        setCompletingTaskId(task.id);
        logCareAction.mutate(
            { plantId: task.plantId, type: task.type },
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
            )}
        </View>
    );
}
