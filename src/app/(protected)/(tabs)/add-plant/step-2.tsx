import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import { useAddPlantStore } from '@/src/stores/add-plant.store';
import { Icon, router } from 'expo-router';
import { Bath, BedDouble, Monitor, Plus, Sofa, Sun, UtensilsCrossed } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

const LOCATIONS = [
    { id: 'living-room', label: 'Living Room', sublabel: 'Sofa area', Icon: Sofa },
    { id: 'bedroom', label: 'Bedroom', sublabel: 'Bedside', Icon: BedDouble },
    { id: 'balcony', label: 'Balcony', sublabel: 'Outdoor', Icon: Sun },
    { id: 'office', label: 'Office', sublabel: 'Desk area', Icon: Monitor },
    { id: 'kitchen', label: 'Kitchen', sublabel: 'Counter top', Icon: UtensilsCrossed },
    { id: 'bathroom', label: 'Bathroom', sublabel: 'Shelf', Icon: Bath },
];

export default function AddPlantStep2() {
    const { location, setLocation } = useAddPlantStore();
    const canProceed = location.length > 0;

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {/* Progress */}
                <AppText size="xs" color="gray" className="pt-4 mb-2 tracking-widest">
                    STEP 2 OF 4
                </AppText>
                <View className="flex-row gap-1.5 mb-6">
                    <View className="flex-1 h-1 rounded-full bg-green-700" />
                    <View className="flex-1 h-1 rounded-full bg-green-700" />
                    <View className="flex-1 h-1 rounded-full bg-gray-200" />
                    <View className="flex-1 h-1 rounded-full bg-gray-200" />
                </View>

                <AppText size="md" font="bold" className="mb-6">
                    Where does it{'\n'}live?
                </AppText>

                {/* Location grid */}
                <View className="flex-row flex-wrap gap-3 mb-6">
                    {LOCATIONS.map(({ id, label, sublabel, Icon }) => {
                        const isSelected = location === id;
                        return (
                            <Pressable
                                key={id}
                                onPress={() => setLocation(id)}
                                style={{
                                    width: '47%',
                                    backgroundColor: isSelected ? '#F0F7EC' : '#FAFAFA',
                                    borderWidth: 2,
                                    borderColor: isSelected ? COLORS.primaryDark : COLORS.border,
                                    borderRadius: 16,
                                    padding: 16,
                                    alignItems: 'flex-start',
                                }}
                            >
                                <Icon
                                    size={24}
                                    color={isSelected ? COLORS.primaryDark : COLORS.textSecondary}
                                />
                                <AppText size="sm" font="semiBold" className="mt-2">
                                    {label}
                                </AppText>
                                <AppText size="xs" color="gray">
                                    {sublabel}
                                </AppText>
                            </Pressable>
                        );
                    })}

                    {/* Add Custom tile */}
                    <Pressable
                        onPress={() => {
                            // TODO: implement custom location input
                        }}
                        style={{
                            width: '47%',
                            backgroundColor: '#FAFAFA',
                            borderWidth: 2,
                            borderStyle: 'dashed',
                            borderColor: COLORS.border,
                            borderRadius: 16,
                            padding: 16,
                            alignItems: 'flex-start',
                        }}
                    >
                        <Plus size={24} color={COLORS.textTertiary} />
                        <AppText size="sm" font="semiBold" className="mt-2">
                            Add Custom
                        </AppText>
                        <AppText size="xs" color="gray">
                            Your space
                        </AppText>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Footer buttons */}
            <View className="px-6 pb-8 flex-row gap-3">
                <Pressable
                    onPress={() => router.back()}
                    className="flex-1 h-[52px] rounded-xl items-center justify-center border-2"
                    style={{ borderColor: COLORS.border }}
                >
                    <AppText size="sm" font="bold">
                        <Icon sf={'arrow.left'} />
                        Back
                    </AppText>
                </Pressable>
                <Pressable
                    onPress={() => router.push('/(protected)/add-plant/step-3')}
                    disabled={!canProceed}
                    className="flex-1 h-[52px] rounded-xl items-center justify-center"
                    style={{ backgroundColor: canProceed ? COLORS.primaryDark : COLORS.border }}
                >
                    <AppText size="sm" font="bold" color="white">
                        Next Step
                        <Icon sf={'arrow.right'} />
                    </AppText>
                </Pressable>
            </View>
        </View>
    );
}
