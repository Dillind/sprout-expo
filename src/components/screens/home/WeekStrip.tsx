import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';
import { Pressable, View } from 'react-native';
import { getTasksForDate, Task } from '@/src/utils/tasks';

type Props = {
    selectedDate: Dayjs;
    tasks: Task[];
    onSelectDate: (date: Dayjs) => void;
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeekStrip({ selectedDate, tasks, onSelectDate }: Props) {
    // Get Monday of current week (locale-independent)
    const monday = dayjs().subtract((dayjs().day() + 6) % 7, 'day').startOf('day');
    const today = dayjs().startOf('day');

    return (
        <View className="flex-row px-4 py-3 gap-1">
            {Array.from({ length: 7 }, (_, i) => {
                const day = monday.add(i, 'day');
                const isSelected = day.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD');
                const isToday = day.format('YYYY-MM-DD') === today.format('YYYY-MM-DD');
                const dayTasks = getTasksForDate(tasks, day);
                const hasOverdue = dayTasks.some((t) => t.isOverdue);
                const hasTasks = dayTasks.length > 0;

                return (
                    <Pressable
                        key={day.format('YYYY-MM-DD')}
                        onPress={() => onSelectDate(day)}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            paddingVertical: 8,
                            paddingHorizontal: 2,
                            borderRadius: 12,
                            backgroundColor: isSelected ? COLORS.primaryDark : isToday ? '#F0F7EC' : 'transparent',
                        }}
                    >
                        <AppText
                            size="xs"
                            color={isSelected ? 'white' : 'gray'}
                            className="mb-1"
                        >
                            {DAY_LABELS[i]}
                        </AppText>
                        <AppText
                            size="sm"
                            font="bold"
                            color={isSelected ? 'white' : 'black'}
                        >
                            {day.format('D')}
                        </AppText>
                        <View style={{ width: 6, height: 6, marginTop: 4, borderRadius: 3, backgroundColor: hasTasks ? (hasOverdue ? '#E85D4A' : COLORS.primary) : 'transparent' }} />
                    </Pressable>
                );
            })}
        </View>
    );
}
