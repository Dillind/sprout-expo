import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import { Dayjs } from 'dayjs';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const DOT_COLORS: Record<string, string> = {
    WATER: '#4A9EE8',
    FERTILIZE: '#78B652',
    REPOT: '#A0714F',
};

const DOT_MAX = 2; // max dots shown before +N label

type Props = {
    day: Dayjs;
    isSelected: boolean;
    isToday: boolean;
    careTypes: Set<string> | undefined;
    onPress: () => void;
};

export default function DayCell({ day, isSelected, isToday, careTypes, onPress }: Props) {
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
                <AppText size="base" font="bold" color={isSelected ? 'white' : 'black'}>
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
