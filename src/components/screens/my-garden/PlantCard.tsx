import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import { Plant } from '@/src/api/plants';
import { getPlantHealth, getNextWaterLabel, HEALTH_COLORS } from '@/src/utils/plant-health';
import { getPlantPhotoUrl } from '@/src/utils/plant-photo';
import { Droplets, Leaf, MapPin } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, View } from 'react-native';

type Props = { plant: Plant; onPress: (plant: Plant) => void };

export default function PlantCard({ plant, onPress }: Props) {
    const health = getPlantHealth(plant);
    const healthColor = HEALTH_COLORS[health];
    const nextWater = getNextWaterLabel(plant);
    const isUrgent = nextWater.startsWith('Overdue') || nextWater === 'Today';
    const photoUrl = getPlantPhotoUrl(plant.photoUrl, 112, 112);

    return (
        <Pressable
            onPress={() => onPress(plant)}
            style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 14,
                marginBottom: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                borderWidth: 1,
                borderColor: COLORS.border,
            }}
        >
            {/* Photo / icon */}
            {photoUrl ? (
                <Image
                    source={{ uri: photoUrl }}
                    style={{ width: 56, height: 56, borderRadius: 12 }}
                    resizeMode="cover"
                />
            ) : (
                <View
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        backgroundColor: '#F0F7EC',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Leaf size={24} color={COLORS.primaryDark} />
                </View>
            )}

            {/* Info */}
            <View style={{ flex: 1, gap: 3 }}>
                <AppText size="sm" font="semiBold">
                    {plant.name}
                </AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MapPin size={11} color={COLORS.textTertiary} />
                    <AppText size="xs" color="gray">
                        {plant.location}
                    </AppText>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Droplets size={11} color={isUrgent ? COLORS.info : COLORS.textTertiary} />
                    <AppText size="xs" style={{ color: isUrgent ? COLORS.info : COLORS.textTertiary }}>
                        {nextWater}
                    </AppText>
                </View>
            </View>

            {/* Health dot */}
            <View
                style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: healthColor,
                }}
            />
        </Pressable>
    );
}
