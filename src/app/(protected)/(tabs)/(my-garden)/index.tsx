import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import { usePlants } from '@/src/hooks/plants';
import { Plant } from '@/src/api/plants';
import { router } from 'expo-router';
import { Leaf, Plus } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native';

function PlantCard({ plant }: { plant: Plant }) {
    return (
        <View
            className="bg-white rounded-2xl p-4 mb-3 flex-row items-center gap-4"
            style={{ borderWidth: 1, borderColor: COLORS.border }}
        >
            <View
                className="w-12 h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: '#F0F7EC' }}
            >
                <Leaf size={22} color={COLORS.primaryDark} />
            </View>
            <View className="flex-1">
                <AppText size="sm" font="semiBold">
                    {plant.name}
                </AppText>
                <AppText size="xs" color="gray">
                    {plant.location}
                </AppText>
            </View>
            <AppText size="xs" color="gray">
                Every {plant.wateringDays}d
            </AppText>
        </View>
    );
}

function EmptyState() {
    return (
        <View className="flex-1 items-center justify-center py-20">
            <View
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: '#F0F7EC' }}
            >
                <Leaf size={36} color={COLORS.primary} />
            </View>
            <AppText size="md" font="semiBold" className="mb-1">
                No plants yet
            </AppText>
            <AppText size="sm" color="gray" align="center">
                Add your first plant to get started
            </AppText>
        </View>
    );
}

export default function MyGardenScreen() {
    const { plants, isLoading, isError, refetch, isRefetching } = usePlants();

    return (
        <View className="flex-1" style={{ backgroundColor: COLORS.backgroundSecondary }}>
            {/* Header */}
            <View
                className="flex-row items-center justify-between px-6 pt-14 pb-4 bg-white"
                style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border }}
            >
                <AppText size="lg" font="bold">
                    My Garden
                </AppText>
                <Pressable
                    onPress={() => router.push('/(protected)/add-plant')}
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: COLORS.primaryDark }}
                >
                    <Plus size={20} color="#fff" />
                </Pressable>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : isError ? (
                <View className="flex-1 items-center justify-center px-6">
                    <AppText size="sm" color="gray" align="center" className="mb-4">
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
                    data={plants}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <PlantCard plant={item} />}
                    ListEmptyComponent={<EmptyState />}
                    contentContainerStyle={{ padding: 16, flexGrow: 1 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            tintColor={COLORS.primary}
                        />
                    }
                />
            )}
        </View>
    );
}
