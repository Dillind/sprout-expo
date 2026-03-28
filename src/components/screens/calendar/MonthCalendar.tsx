import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import { getTasksByDateTypeMap, Task } from '@/src/utils/tasks';
import dayjs, { Dayjs } from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';

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
const DOT_MAX = 2; // max dots shown before +N label

function DayCell({
    day,
    isSelected,
    isToday,
    careTypes,
    onPress,
}: {
    day: Dayjs;
    isSelected: boolean;
    isToday: boolean;
    careTypes: Set<string> | undefined;
    onPress: () => void;
}) {
    const scale = useSharedValue(isSelected ? 1 : 0.7);

    // Animate to 1 when selected, back to 0.7 when deselected
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isSelected ? 1 : 0.7, { damping: 14, stiffness: 180 }) }],
    }));

    const dotTypes = careTypes ? Array.from(careTypes) : [];
    const visibleDots = dotTypes.slice(0, DOT_MAX);
    const overflow = dotTypes.length - DOT_MAX;

    return (
        <Pressable
            onPress={onPress}
            style={{ flex: 1, height: 52, alignItems: 'center', justifyContent: 'center' }}
        >
            <Animated.View
                style={[
                    {
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected ? COLORS.primaryDark : 'transparent',
                        borderWidth: isToday && !isSelected ? 1.5 : 0,
                        borderColor: COLORS.primaryDark,
                    },
                    animatedStyle,
                ]}
            >
                <AppText size="xs" font="bold" color={isSelected ? 'white' : 'black'}>
                    {day.format('D')}
                </AppText>
            </Animated.View>

            {/* Dots row */}
            {dotTypes.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 }}>
                    {visibleDots.map((type) => (
                        <View
                            key={type}
                            style={{
                                width: 4,
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: DOT_COLORS[type] ?? COLORS.primary,
                            }}
                        />
                    ))}
                    {overflow > 0 && (
                        <AppText
                            size="xs"
                            style={{ fontSize: 7, color: COLORS.textSecondary, lineHeight: 8 }}
                        >
                            +{overflow}
                        </AppText>
                    )}
                </View>
            )}
        </Pressable>
    );
}

export default function MonthCalendar({
    month,
    tasks,
    selectedDate,
    onSelectDate,
    onPrevMonth,
    onNextMonth,
}: Props) {
    const today = dayjs().startOf('day');
    const taskMap = useMemo(() => getTasksByDateTypeMap(tasks), [tasks]);

    const swipeGesture = Gesture.Pan()
        .activeOffsetX([-20, 20])
        .failOffsetY([-10, 10]) // yield to ScrollView if user is scrolling vertically
        .onEnd((event) => {
            if (event.translationX < -50) {
                runOnJS(onNextMonth)();
            } else if (event.translationX > 50) {
                runOnJS(onPrevMonth)();
            }
        });

    const grid = useMemo(() => {
        const firstDay = month.startOf('month');
        const startPad = (firstDay.day() + 6) % 7;
        const daysInMonth = month.daysInMonth();
        const cells: (Dayjs | null)[] = [];
        for (let i = 0; i < startPad; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(firstDay.date(d));
        while (cells.length % 7 !== 0) cells.push(null);
        return cells;
    }, [month]);

    return (
        <GestureDetector gesture={swipeGesture}>
        <View style={{ backgroundColor: '#fff', paddingBottom: 8 }}>
            {/* Month header */}
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
                <Pressable
                    onPress={onPrevMonth}
                    style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
                >
                    <ChevronLeft size={20} color={COLORS.textSecondary} />
                </Pressable>
                <AppText size="sm" font="bold">
                    {month.format('MMMM YYYY')}
                </AppText>
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
                        <AppText size="xs" color="gray">
                            {d}
                        </AppText>
                    </View>
                ))}
            </View>

            {/* Grid */}
            <View className="px-2">
                {Array.from({ length: Math.ceil(grid.length / 7) }, (_, row) => (
                    <View key={row} className="flex-row mb-1">
                        {grid.slice(row * 7, row * 7 + 7).map((day, col) => {
                            if (!day) return <View key={col} style={{ flex: 1, height: 52 }} />;
                            const dateStr = day.format('YYYY-MM-DD');
                            return (
                                <DayCell
                                    key={dateStr}
                                    day={day}
                                    isSelected={dateStr === selectedDate.format('YYYY-MM-DD')}
                                    isToday={dateStr === today.format('YYYY-MM-DD')}
                                    careTypes={taskMap.get(dateStr)}
                                    onPress={() => onSelectDate(day)}
                                />
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>
        </GestureDetector>
    );
}
