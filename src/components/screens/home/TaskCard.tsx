import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import { Task } from '@/src/utils/tasks';
import { getPlantPhotoUrl } from '@/src/utils/plant-photo';
import { Droplets, Flower2, RefreshCw, Check } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Image, Pressable, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

type Props = {
    task: Task;
    onToggle: (task: Task) => void;
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

export default function TaskCard({ task, onToggle, isCompleting, onOptions }: Props) {
    const isCompleted = !!task.completedAt;
    const careColor = isCompleted
        ? COLORS.textSecondary
        : (CARE_COLORS[task.type] ?? COLORS.primary);

    const checkScale = useSharedValue(isCompleted ? 1 : 0);

    const checkStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkScale.value }],
        opacity: checkScale.value,
    }));

    const handlePress = useCallback(() => {
        if (!isCompleted) {
            checkScale.value = withSpring(1, { damping: 12, stiffness: 200 });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            checkScale.value = withSpring(0, { damping: 12, stiffness: 200 });
        }
        onToggle(task);
    }, [task, onToggle, isCompleted]);

    const displayLabel = task.title ?? CARE_LABELS[task.type];
    const activeCareColor = CARE_COLORS[task.type] ?? COLORS.primary;
    const photoUrl = getPlantPhotoUrl(task.plantPhotoUrl, 96, 96);

    return (
        <View
            style={{
                backgroundColor: isCompleted ? COLORS.backgroundSecondary : '#fff',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                borderWidth: 1,
                borderColor: isCompleted ? 'transparent' : task.isOverdue ? '#FDDEDD' : COLORS.border,
                opacity: isCompleted ? 0.7 : 1,
            }}
        >
            {/* Plant photo or icon */}
            {photoUrl ? (
                <Image
                    source={{ uri: photoUrl }}
                    style={{ width: 48, height: 48, borderRadius: 12 }}
                    resizeMode="cover"
                />
            ) : (
                <View
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: `${activeCareColor}20`,
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
                    <AppText
                        size="sm"
                        font="semiBold"
                        style={isCompleted ? { textDecorationLine: 'line-through', color: COLORS.textSecondary } : undefined}
                    >
                        {task.plantName}
                    </AppText>
                    {task.isOverdue && !isCompleted && (
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
                        backgroundColor: isCompleted ? `${COLORS.textSecondary}18` : `${activeCareColor}18`,
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

            {/* Toggle button */}
            <Pressable
                onPress={handlePress}
                disabled={isCompleting}
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    borderWidth: 2,
                    borderColor: isCompleted ? COLORS.textSecondary : activeCareColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isCompleted ? COLORS.textSecondary : 'transparent',
                }}
            >
                <Animated.View style={[{ position: 'absolute' }, checkStyle]}>
                    <Check size={18} color={isCompleted ? '#fff' : activeCareColor} strokeWidth={3} />
                </Animated.View>
            </Pressable>
        </View>
    );
}
