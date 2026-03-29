import AppText from '@/src/components/core/AppText';
import GardenStatsBar from '@/src/components/screens/my-garden/GardenStatsBar';
import LocationFilterTabs from '@/src/components/screens/my-garden/LocationFilterTabs';
import PlantCard from '@/src/components/screens/my-garden/PlantCard';
import { COLORS } from '@/src/constants/theme';
import { usePlants } from '@/src/hooks/plants';
import { Plant } from '@/src/types/db';
import { sortPlantsByUrgency } from '@/src/utils/plant-health';
import { router } from 'expo-router';
import { Leaf } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native';

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
            <View
                style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: '#F0F7EC',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                }}
            >
                <Leaf size={36} color={COLORS.primary} />
            </View>
            <AppText size="md" font="semiBold" style={{ marginBottom: 4 }}>
                {hasFilter ? 'No plants here' : 'No plants yet'}
            </AppText>
            <AppText size="sm" color="gray" align="center">
                {hasFilter ? 'Try a different location filter' : 'Add your first plant to get started'}
            </AppText>
        </View>
    );
}

export default function MyGardenScreen() {
    const { plants, isLoading, isError, refetch, isRefetching } = usePlants();
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

    const locations = useMemo(
        () => [...new Set(plants.map((p) => p.location))].sort(),
        [plants],
    );

    const filtered = useMemo(() => {
        const base = selectedLocation
            ? plants.filter((p) => p.location === selectedLocation)
            : plants;
        return sortPlantsByUrgency(base);
    }, [plants, selectedLocation]);

    const handlePlantPress = (plant: Plant) => {
        router.push(`/(protected)/(tabs)/(my-garden)/${plant.id}`);
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.backgroundSecondary }}>
            {/* Header */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 24,
                    paddingTop: 56,
                    paddingBottom: 16,
                    backgroundColor: '#fff',
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.border,
                }}
            >
                <AppText size="lg" font="bold">
                    My Garden
                </AppText>
            </View>

            {isLoading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : isError ? (
                <View
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}
                >
                    <AppText size="sm" color="gray" align="center" style={{ marginBottom: 16 }}>
                        Failed to load plants
                    </AppText>
                    <Pressable onPress={() => refetch()}>
                        <AppText size="sm" font="semiBold" style={{ color: COLORS.primaryDark }}>
                            Try again
                        </AppText>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <PlantCard plant={item} onPress={handlePlantPress} />}
                    ListHeaderComponent={
                        <>
                            <View style={{ height: 16 }} />
                            <GardenStatsBar plants={plants} />
                            {locations.length > 0 && (
                                <LocationFilterTabs
                                    locations={locations}
                                    selected={selectedLocation}
                                    onSelect={setSelectedLocation}
                                />
                            )}
                        </>
                    }
                    ListEmptyComponent={<EmptyState hasFilter={selectedLocation !== null} />}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, flexGrow: 1 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            tintColor={COLORS.primary}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}
