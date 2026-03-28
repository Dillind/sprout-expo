import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import { Task } from '@/src/utils/tasks';
import { Droplets, Flower2, RefreshCw, Check } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Image, Pressable, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

type Props = {
    task: Task;
    onComplete: (task: Task) => void;
    isCompleting?: boolean;
    onOptions?: (task: Task) => void;
};

const CARE_COLORS: Record<string, string> = {
    WATER: '#4A9EE8',
    FERTILIZE: '#78B652',
    REPOT: '#A0714F',
};

const CARE_LABELS: Record<string, string> = {
    WATER: 'Water',
    FERTILIZE: 'Fertilize',
    REPOT: 'Repot',
};

function CareIcon({ type, size, color }: { type: string; size: number; color: string }) {
    if (type === 'WATER') return <Droplets size={size} color={color} />;
    if (type === 'FERTILIZE') return <Flower2 size={size} color={color} />;
    return <RefreshCw size={size} color={color} />;
}

export default function TaskCard({ task, onComplete, isCompleting, onOptions }: Props) {
    const careColor = CARE_COLORS[task.type] ?? COLORS.primary;
    const checkScale = useSharedValue(0);
    const cardOpacity = useSharedValue(1);
    const cardTranslateX = useSharedValue(0);

    const checkStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkScale.value }],
        opacity: checkScale.value,
    }));

    const cardStyle = useAnimatedStyle(() => ({
        opacity: cardOpacity.value,
        transform: [{ translateX: cardTranslateX.value }],
    }));

    const handleComplete = useCallback(() => {
        // 1. Spring the checkmark in
        checkScale.value = withSpring(1, { damping: 12, stiffness: 200 });
        // 2. Haptic at the moment the check appears
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // 3. After 280ms, slide the card out and call onComplete
        cardOpacity.value = withTiming(0, { duration: 280 });
        cardTranslateX.value = withTiming(400, { duration: 280 }, (finished) => {
            if (finished) runOnJS(onComplete)(task);
        });
    }, [task, onComplete]);

    const displayLabel = task.title ?? CARE_LABELS[task.type];

    return (
        <Animated.View
            style={[
                {
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    borderWidth: 1,
                    borderColor: task.isOverdue ? '#FDDEDD' : COLORS.border,
                },
                cardStyle,
            ]}
        >
            {/* Plant photo or icon */}
            {task.plantPhotoUrl ? (
                <Image
                    source={{ uri: task.plantPhotoUrl }}
                    style={{ width: 48, height: 48, borderRadius: 12 }}
                    resizeMode="cover"
                />
            ) : (
                <View
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: `${careColor}20`,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <CareIcon type={task.type} size={22} color={careColor} />
                </View>
            )}

            {/* Task info */}
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <AppText size="sm" font="semiBold">
                        {task.plantName}
                    </AppText>
                    {task.isOverdue && (
                        <View
                            style={{
                                backgroundColor: '#FDDEDD',
                                borderRadius: 4,
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                            }}
                        >
                            <AppText size="xs" style={{ color: COLORS.error }}>
                                Overdue
                            </AppText>
                        </View>
                    )}
                </View>
                <View
                    style={{
                        alignSelf: 'flex-start',
                        backgroundColor: `${careColor}18`,
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                    }}
                >
                    <AppText size="xs" style={{ color: careColor }}>
                        {displayLabel}
                    </AppText>
                </View>
            </View>

            {/* Options button */}
            {onOptions && (
                <Pressable onPress={() => onOptions(task)} hitSlop={8} style={{ padding: 4 }}>
                    <AppText size="sm" color="gray" style={{ letterSpacing: 1 }}>···</AppText>
                </Pressable>
            )}

            {/* Complete button */}
            <Pressable
                onPress={handleComplete}
                disabled={isCompleting}
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    borderWidth: 2,
                    borderColor: careColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                }}
            >
                <Animated.View style={[{ position: 'absolute' }, checkStyle]}>
                    <Check size={18} color={careColor} strokeWidth={3} />
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
}
