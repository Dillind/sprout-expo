import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import { getTasksByDateTypeMap, Task } from '@/src/utils/tasks';
import dayjs, { Dayjs } from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';

type Props = {
    month: Dayjs;
    tasks: Task[];
    selectedDate: Dayjs;
    onSelectDate: (date: Dayjs) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
};

const DOT_COLORS: Record<string, string> = {
    WATER: '#4A9EE8',
    FERTILIZE: '#78B652',
    REPOT: '#A0714F',
};

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MonthCalendar({ month, tasks, selectedDate, onSelectDate, onPrevMonth, onNextMonth }: Props) {
    const today = dayjs().startOf('day');
    const taskMap = useMemo(() => getTasksByDateTypeMap(tasks), [tasks]);

    // Build grid: pad with nulls before the 1st, Monday-first
    const grid = useMemo(() => {
        const firstDay = month.startOf('month');
        // Monday=0, ..., Sunday=6
        const startPad = (firstDay.day() + 6) % 7;
        const daysInMonth = month.daysInMonth();
        const cells: (Dayjs | null)[] = [];

        for (let i = 0; i < startPad; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(firstDay.date(d));

        // Pad end to complete final row
        while (cells.length % 7 !== 0) cells.push(null);
        return cells;
    }, [month]);

    return (
        <View style={{ backgroundColor: '#fff', paddingBottom: 8 }}>
            {/* Month header */}
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
                <Pressable
                    onPress={onPrevMonth}
                    style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
                >
                    <ChevronLeft size={20} color={COLORS.textSecondary} />
                </Pressable>
                <AppText size="sm" font="bold">{month.format('MMMM YYYY')}</AppText>
                <Pressable
                    onPress={onNextMonth}
                    style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
                >
                    <ChevronRight size={20} color={COLORS.textSecondary} />
                </Pressable>
            </View>

            {/* Day-of-week headers */}
            <View className="flex-row px-2 mb-1">
                {DAY_HEADERS.map((d) => (
                    <View key={d} style={{ flex: 1, alignItems: 'center' }}>
                        <AppText size="xs" color="gray">{d}</AppText>
                    </View>
                ))}
            </View>

            {/* Calendar grid */}
            <View className="px-2">
                {Array.from({ length: Math.ceil(grid.length / 7) }, (_, row) => (
                    <View key={row} className="flex-row mb-1">
                        {grid.slice(row * 7, row * 7 + 7).map((day, col) => {
                            if (!day) {
                                return <View key={col} style={{ flex: 1, height: 48 }} />;
                            }

                            const dateStr = day.format('YYYY-MM-DD');
                            const isSelected = dateStr === selectedDate.format('YYYY-MM-DD');
                            const isToday = dateStr === today.format('YYYY-MM-DD');
                            const careTypes = taskMap.get(dateStr);

                            return (
                                <Pressable
                                    key={dateStr}
                                    onPress={() => onSelectDate(day)}
                                    style={{
                                        flex: 1,
                                        height: 48,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: 17,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: isSelected ? COLORS.primaryDark : 'transparent',
                                            borderWidth: isToday && !isSelected ? 1.5 : 0,
                                            borderColor: COLORS.primaryDark,
                                        }}
                                    >
                                        <AppText
                                            size="xs"
                                            font="bold"
                                            color={isSelected ? 'white' : 'black'}
                                        >
                                            {day.format('D')}
                                        </AppText>
                                    </View>
                                    {/* Care type dots */}
                                    {careTypes && careTypes.size > 0 && (
                                        <View className="flex-row gap-0.5 mt-0.5">
                                            {Array.from(careTypes).slice(0, 3).map((type) => (
                                                <View
                                                    key={type}
                                                    style={{
                                                        width: 4, height: 4, borderRadius: 2,
                                                        backgroundColor: DOT_COLORS[type] ?? COLORS.primary,
                                                    }}
                                                />
                                            ))}
                                        </View>
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>
    );
}
