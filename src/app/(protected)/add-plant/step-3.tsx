import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import { useAddPlantStore } from '@/src/stores/add-plant.store';
import { router } from 'expo-router';
import { Leaf } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';

function frequencyLabel(days: number): string {
    if (days === 1) return 'Every day';
    if (days === 7) return 'Every week';
    if (days === 14) return 'Every 2 weeks';
    if (days === 30) return 'Every month';
    return `Every ${days} days`;
}

export default function AddPlantStep3() {
    const {
        wateringDays,
        waterAmountMl,
        remindersEnabled,
        setWateringDays,
        setWaterAmountMl,
        setRemindersEnabled,
    } = useAddPlantStore();

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {/* Progress */}
                <AppText size="xs" color="gray" className="pt-4 mb-2 tracking-widest">
                    STEP 3 OF 4
                </AppText>
                <View className="flex-row gap-1.5 mb-6">
                    <View className="flex-1 h-1 rounded-full bg-green-700" />
                    <View className="flex-1 h-1 rounded-full bg-green-700" />
                    <View className="flex-1 h-1 rounded-full bg-green-700" />
                    <View className="flex-1 h-1 rounded-full bg-gray-200" />
                </View>

                <AppText size="md" font="bold" className="mb-6">
                    Care{'\n'}Schedule
                </AppText>

                {/* Watering stepper */}
                <View className="bg-gray-50 rounded-2xl p-5 mb-4">
                    <AppText size="sm" font="semiBold" className="mb-4">
                        Watering Frequency
                    </AppText>
                    <View className="flex-row items-center justify-between">
                        <Pressable
                            onPress={() => setWateringDays(Math.max(1, wateringDays - 1))}
                            className="w-10 h-10 rounded-full bg-white items-center justify-center"
                            style={{ borderWidth: 1, borderColor: COLORS.border }}
                        >
                            <AppText size="md" font="bold">
                                −
                            </AppText>
                        </Pressable>
                        <View className="items-center">
                            <AppText size="lg" font="bold">
                                {wateringDays}
                            </AppText>
                            <AppText size="xs" color="gray">
                                days
                            </AppText>
                        </View>
                        <Pressable
                            onPress={() => setWateringDays(Math.min(90, wateringDays + 1))}
                            className="w-10 h-10 rounded-full bg-white items-center justify-center"
                            style={{ borderWidth: 1, borderColor: COLORS.border }}
                        >
                            <AppText size="md" font="bold">
                                +
                            </AppText>
                        </Pressable>
                    </View>
                    <AppText size="xs" color="gray" align="center" className="mt-2">
                        {frequencyLabel(wateringDays)}
                    </AppText>
                </View>

                {/* Water Amount */}
                <View className="bg-gray-50 rounded-2xl p-5 mb-4">
                    <AppText size="sm" font="semiBold" className="mb-1">
                        Water Amount
                    </AppText>
                    <AppText size="xs" color="gray" className="mb-4">
                        How much water does it need?
                    </AppText>
                    <View className="flex-row items-center gap-3">
                        <Pressable
                            onPress={() =>
                                setWaterAmountMl(
                                    waterAmountMl !== null ? Math.max(0, waterAmountMl - 50) : null,
                                )
                            }
                            className="w-10 h-10 rounded-full bg-white items-center justify-center"
                            style={{ borderWidth: 1, borderColor: COLORS.border }}
                        >
                            <AppText size="md" font="bold">
                                −
                            </AppText>
                        </Pressable>
                        <View className="flex-1 items-center">
                            <AppText size="lg" font="bold">
                                {waterAmountMl ?? '—'}
                            </AppText>
                            <AppText size="xs" color="gray">
                                {waterAmountMl !== null ? 'ml' : 'not set'}
                            </AppText>
                        </View>
                        <Pressable
                            onPress={() => setWaterAmountMl((waterAmountMl ?? 0) + 50)}
                            className="w-10 h-10 rounded-full bg-white items-center justify-center"
                            style={{ borderWidth: 1, borderColor: COLORS.border }}
                        >
                            <AppText size="md" font="bold">
                                +
                            </AppText>
                        </Pressable>
                    </View>
                    <Pressable onPress={() => setWaterAmountMl(null)} className="mt-3 items-center">
                        <AppText size="xs" color="gray">
                            Skip (not sure)
                        </AppText>
                    </Pressable>
                </View>

                {/* Reminders toggle */}
                <View className="bg-gray-50 rounded-2xl p-5 mb-4 flex-row items-center justify-between">
                    <View>
                        <AppText size="sm" font="semiBold">
                            Watering Reminders
                        </AppText>
                        <AppText size="xs" color="gray">
                            Get notified when it&apos;s time to water
                        </AppText>
                    </View>
                    <Switch
                        value={remindersEnabled}
                        onValueChange={setRemindersEnabled}
                        trackColor={{ false: COLORS.border, true: COLORS.primary }}
                        thumbColor="#FFFFFF"
                    />
                </View>

                {/* Leafling tip box */}
                <View
                    className="rounded-2xl p-4 mb-6 flex-row gap-3"
                    style={{ backgroundColor: '#F0F7EC' }}
                >
                    <Leaf size={20} color={COLORS.primaryDark} />
                    <View className="flex-1">
                        <AppText size="xs" font="semiBold" className="mb-1">
                            Leafling says
                        </AppText>
                        <AppText size="xs" color="gray">
                            Most houseplants thrive with watering every 7–14 days. Start with 7 and
                            adjust based on your plant&apos;s needs.
                        </AppText>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View className="px-6 pb-8 flex-row gap-3">
                <Pressable
                    onPress={() => router.back()}
                    className="flex-1 h-[52px] rounded-xl items-center justify-center border-2"
                    style={{ borderColor: COLORS.border }}
                >
                    <AppText size="sm" font="bold">
                        ← Back
                    </AppText>
                </Pressable>
                <Pressable
                    onPress={() => router.push('/(protected)/add-plant/step-4')}
                    className="flex-1 h-[52px] rounded-xl items-center justify-center"
                    style={{ backgroundColor: COLORS.primaryDark }}
                >
                    <AppText size="sm" font="bold" color="white">
                        Next Step →
                    </AppText>
                </Pressable>
            </View>
        </View>
    );
}
