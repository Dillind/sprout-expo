import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import { Droplets, Flower2, RefreshCw } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Image, Pressable, View } from 'react-native';
import { Task } from '@/src/utils/tasks';

type Props = {
    task: Task;
    onComplete: (task: Task) => void;
    isCompleting?: boolean;
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

export default function TaskCard({ task, onComplete, isCompleting }: Props) {
    const careColor = CARE_COLORS[task.type] ?? COLORS.primary;

    return (
        <View
            className="bg-white rounded-2xl p-4 mb-3 flex-row items-center gap-3"
            style={{ borderWidth: 1, borderColor: task.isOverdue ? '#FDDEDD' : COLORS.border }}
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
            <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
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
                        {CARE_LABELS[task.type]}
                    </AppText>
                </View>
            </View>

            {/* Complete button */}
            <Pressable
                onPress={() => onComplete(task)}
                disabled={isCompleting}
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    borderWidth: 2,
                    borderColor: isCompleting ? COLORS.border : careColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {isCompleting ? <ActivityIndicator size="small" color={careColor} /> : null}
            </Pressable>
        </View>
    );
}
