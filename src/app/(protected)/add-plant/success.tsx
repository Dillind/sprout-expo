import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { Leaf, MapPin, X } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';

const LOCATION_LABELS: Record<string, string> = {
    'living-room': 'Living Room',
    'bedroom': 'Bedroom',
    'balcony': 'Balcony',
    'office': 'Office',
    'kitchen': 'Kitchen',
    'bathroom': 'Bathroom',
};

export default function AddPlantSuccess() {
    const { plantName, location } = useLocalSearchParams<{ plantName: string; location: string }>();
    const locationLabel = LOCATION_LABELS[location] ?? location;

    return (
        <View className="flex-1 bg-white">
            {/* Close button */}
            <View className="px-6 pt-4 items-end">
                <Pressable
                    onPress={() => router.replace('/(protected)/(tabs)/(home)')}
                    className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                >
                    <X size={20} color={COLORS.textPrimary} />
                </Pressable>
            </View>

            {/* Content */}
            <View className="flex-1 items-center justify-center px-6">
                {/* Plant icon circle */}
                <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-6">
                    <Leaf size={40} color={COLORS.primaryDark} />
                </View>

                <AppText size="md" font="bold" align="center" className="mb-2">
                    Plant added successfully!
                </AppText>
                <AppText size="sm" color="gray" align="center" className="mb-8">
                    Your plant has been added to your garden.
                </AppText>

                {/* Plant card */}
                <View
                    className="w-full rounded-2xl p-5 mb-8"
                    style={{ backgroundColor: '#F0F7EC' }}
                >
                    <AppText size="sm" font="bold" className="mb-1">{plantName}</AppText>
                    <View className="flex-row items-center gap-1.5">
                        <MapPin size={14} color={COLORS.textSecondary} />
                        <AppText size="xs" color="gray">{locationLabel}</AppText>
                    </View>
                </View>

                {/* Action buttons */}
                <View className="w-full gap-3">
                    <Pressable
                        onPress={() => router.replace('/(protected)/add-plant')}
                        className="w-full h-[52px] rounded-xl items-center justify-center border-2"
                        style={{ borderColor: COLORS.primaryDark }}
                    >
                        <AppText size="sm" font="bold">+ Add Another</AppText>
                    </Pressable>
                    <Pressable
                        onPress={() => router.replace('/(protected)/(tabs)/(my-garden)')}
                        className="w-full h-[52px] rounded-xl items-center justify-center"
                        style={{ backgroundColor: COLORS.primaryDark }}
                    >
                        <AppText size="sm" font="bold" color="white">View Garden</AppText>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
