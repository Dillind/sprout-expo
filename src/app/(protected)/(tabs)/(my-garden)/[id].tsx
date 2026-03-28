import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import { useLogCareAction } from '@/src/hooks/care-logs';
import { usePlants, useDeletePlant } from '@/src/hooks/plants';
import { getPlantHealth, getNextWaterLabel, HEALTH_COLORS } from '@/src/utils/plant-health';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Droplets, Flower2, Leaf, MapPin, Pencil, RefreshCw } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, View } from 'react-native';

function CareRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {icon}
            <AppText size="sm" style={{ flex: 1 }}>
                {label}
            </AppText>
            <AppText size="sm" color="gray">
                {value}
            </AppText>
        </View>
    );
}

export default function PlantDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { plants, isLoading } = usePlants();
    const logCareAction = useLogCareAction();
    const deletePlant = useDeletePlant();
    const [logging, setLogging] = useState(false);

    const plant = plants.find((p) => p.id === id);

    if (isLoading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!plant) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <AppText size="sm" color="gray" align="center">
                    Plant not found.
                </AppText>
                <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
                    <AppText size="sm" font="semiBold" style={{ color: COLORS.primaryDark }}>
                        Go back
                    </AppText>
                </Pressable>
            </View>
        );
    }

    const health = getPlantHealth(plant);
    const healthColor = HEALTH_COLORS[health];
    const nextWater = getNextWaterLabel(plant);
    const isUrgent = nextWater.startsWith('Overdue') || nextWater === 'Today';

    const handleMarkWatered = () => {
        setLogging(true);
        logCareAction.mutate(
            { plantId: plant.id, type: 'WATER' },
            { onSettled: () => setLogging(false) },
        );
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Plant',
            `Remove "${plant.name}" from your garden? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deletePlant.mutate(plant.id);
                        router.back();
                    },
                },
            ],
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.backgroundSecondary }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero photo */}
                <View style={{ position: 'relative' }}>
                    {plant.photoUrl ? (
                        <Image
                            source={{ uri: plant.photoUrl }}
                            style={{ width: '100%', height: 280 }}
                            resizeMode="cover"
                        />
                    ) : (
                        <View
                            style={{
                                width: '100%',
                                height: 280,
                                backgroundColor: '#F0F7EC',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Leaf size={64} color={COLORS.primaryDark} />
                        </View>
                    )}
                    {/* Back button */}
                    <Pressable
                        onPress={() => router.back()}
                        style={{
                            position: 'absolute',
                            top: 52,
                            left: 16,
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: 'rgba(0,0,0,0.35)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <ChevronLeft size={22} color="#fff" />
                    </Pressable>
                    {/* Edit button */}
                    <Pressable
                        onPress={() => router.push(`/(protected)/add-plant?plantId=${plant.id}`)}
                        style={{
                            position: 'absolute',
                            top: 52,
                            right: 16,
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: 'rgba(0,0,0,0.35)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Pencil size={18} color="#fff" />
                    </Pressable>
                </View>

                {/* Content */}
                <View style={{ padding: 20, gap: 16 }}>
                    {/* Name + health badge */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <AppText size="lg" font="bold" style={{ flex: 1 }}>
                            {plant.name}
                        </AppText>
                        <View
                            style={{
                                backgroundColor: `${healthColor}20`,
                                borderRadius: 12,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                            }}
                        >
                            <AppText size="xs" font="semiBold" style={{ color: healthColor }}>
                                {health.toUpperCase()}
                            </AppText>
                        </View>
                    </View>

                    {/* Location */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <MapPin size={14} color={COLORS.textSecondary} />
                        <AppText size="sm" color="gray">
                            {plant.location}
                        </AppText>
                    </View>

                    {/* Next water card */}
                    <View
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: 16,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: isUrgent ? `${COLORS.info}40` : COLORS.border,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <View
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                backgroundColor: `${COLORS.info}15`,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                            }}
                        >
                            <Droplets size={22} color={COLORS.info} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <AppText
                                size="xs"
                                color="gray"
                                style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                            >
                                Next Water
                            </AppText>
                            <AppText
                                size="sm"
                                font="semiBold"
                                style={{
                                    color: isUrgent ? COLORS.info : COLORS.textPrimary,
                                    marginTop: 2,
                                }}
                            >
                                {nextWater}
                            </AppText>
                        </View>
                        <Pressable
                            onPress={handleMarkWatered}
                            disabled={logging}
                            style={{
                                backgroundColor: COLORS.primaryDark,
                                borderRadius: 10,
                                paddingHorizontal: 14,
                                paddingVertical: 8,
                            }}
                        >
                            {logging ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <AppText size="xs" font="semiBold" style={{ color: '#fff' }}>
                                    Mark Done
                                </AppText>
                            )}
                        </Pressable>
                    </View>

                    {/* Care schedule */}
                    <View
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: 16,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: COLORS.border,
                        }}
                    >
                        <AppText size="sm" font="semiBold" style={{ marginBottom: 12 }}>
                            Care Schedule
                        </AppText>
                        <View style={{ gap: 10 }}>
                            <CareRow
                                icon={<Droplets size={16} color={COLORS.info} />}
                                label="Water"
                                value={`Every ${plant.wateringDays} days`}
                            />
                            {plant.fertilizeDays ? (
                                <CareRow
                                    icon={<Flower2 size={16} color={COLORS.success} />}
                                    label="Fertilize"
                                    value={`Every ${plant.fertilizeDays} days`}
                                />
                            ) : null}
                            {plant.repotDays ? (
                                <CareRow
                                    icon={<RefreshCw size={16} color="#A0714F" />}
                                    label="Repot"
                                    value={`Every ${plant.repotDays} days`}
                                />
                            ) : null}
                        </View>
                    </View>

                    {/* Delete */}
                    <Pressable
                        onPress={handleDelete}
                        style={{ alignItems: 'center', paddingVertical: 12 }}
                    >
                        <AppText size="sm" style={{ color: COLORS.error }}>
                            Delete Plant
                        </AppText>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}
