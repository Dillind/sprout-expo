import { createPlant } from '@/src/api/plants';
import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import supabase from '@/src/lib/supabase';
import { useAddPlantStore } from '@/src/stores/add-plant.store';
import { router } from 'expo-router';
import { Leaf } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

function frequencyLabel(days: number | null): string {
    if (days === null) return 'Disabled';
    if (days === 1) return 'Every day';
    if (days === 7) return 'Every week';
    if (days === 14) return 'Every 2 weeks';
    if (days === 30) return 'Every month';
    if (days === 90) return 'Every 3 months';
    if (days === 180) return 'Every 6 months';
    if (days === 365) return 'Every year';
    return `Every ${days} days`;
}

async function uploadPhoto(uri: string, userId: string): Promise<string | null> {
    const uriWithoutQuery = uri.split('?')[0];
    const ext = uriWithoutQuery.split('.').pop() ?? 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext.toLowerCase()) ? ext.toLowerCase() : 'jpg';
    const fileName = `${userId}/${Date.now()}.${safeExt}`;
    const response = await fetch(uri);
    const blob = await response.blob();
    const { error } = await supabase.storage
        .from('plant-photos')
        .upload(fileName, blob, { contentType: `image/${safeExt}` });
    if (error) return null;
    const { data } = supabase.storage.from('plant-photos').getPublicUrl(fileName);
    return data.publicUrl;
}

export default function AddPlantStep4() {
    const {
        name, photoUri, location,
        wateringDays, waterAmountMl, remindersEnabled,
        fertilizeDays, repotDays,
        setFertilizeDays, setRepotDays, setPhotoUrl, reset,
    } = useAddPlantStore();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                Alert.alert('Session expired', 'Please sign in again.');
                return;
            }

            let photoUrl: string | null = null;
            if (photoUri) {
                photoUrl = await uploadPhoto(photoUri, session.user.id);
                if (!photoUrl) {
                    Alert.alert('Photo upload failed', 'Your plant will be saved without a photo.');
                }
                setPhotoUrl(photoUrl);
            }

            const plant = await createPlant({
                name,
                photoUrl,
                location,
                wateringDays,
                waterAmountMl: waterAmountMl ?? null,
                fertilizeDays: fertilizeDays ?? null,
                repotDays: repotDays ?? null,
                remindersEnabled,
            });

            reset();
            router.replace({
                pathname: '/(protected)/add-plant/success',
                params: { plantName: plant.name, location: plant.location },
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to save your plant. Please try again.');
            console.error('[AddPlant]', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {/* Progress */}
                <AppText size="xs" color="gray" className="pt-4 mb-2 tracking-widest">STEP 4 OF 4</AppText>
                <View className="flex-row gap-1.5 mb-6">
                    <View className="flex-1 h-1 rounded-full bg-green-700" />
                    <View className="flex-1 h-1 rounded-full bg-green-700" />
                    <View className="flex-1 h-1 rounded-full bg-green-700" />
                    <View className="flex-1 h-1 rounded-full bg-green-700" />
                </View>

                <AppText size="md" font="bold" className="mb-6">Advanced{'\n'}Care</AppText>

                {/* Fertilize stepper */}
                <View className="bg-gray-50 rounded-2xl p-5 mb-4">
                    <AppText size="sm" font="semiBold" className="mb-1">Fertilize Frequency</AppText>
                    <AppText size="xs" color="gray" className="mb-4">
                        {frequencyLabel(fertilizeDays)}
                    </AppText>
                    <View className="flex-row items-center justify-between">
                        <Pressable
                            onPress={() => setFertilizeDays(fertilizeDays !== null ? Math.max(7, fertilizeDays - 7) : 30)}
                            className="w-10 h-10 rounded-full bg-white items-center justify-center"
                            style={{ borderWidth: 1, borderColor: COLORS.border }}
                        >
                            <AppText size="md" font="bold">−</AppText>
                        </Pressable>
                        <View className="items-center">
                            <AppText size="lg" font="bold">{fertilizeDays ?? '—'}</AppText>
                            <AppText size="xs" color="gray">{fertilizeDays !== null ? 'days' : 'disabled'}</AppText>
                        </View>
                        <Pressable
                            onPress={() => setFertilizeDays((fertilizeDays ?? 23) + 7)}
                            className="w-10 h-10 rounded-full bg-white items-center justify-center"
                            style={{ borderWidth: 1, borderColor: COLORS.border }}
                        >
                            <AppText size="md" font="bold">+</AppText>
                        </Pressable>
                    </View>
                    <Pressable onPress={() => setFertilizeDays(fertilizeDays !== null ? null : 30)} className="mt-3 items-center">
                        <AppText size="xs" color="gray">
                            {fertilizeDays !== null ? 'Disable fertilizing' : 'Enable (every 30 days)'}
                        </AppText>
                    </Pressable>
                </View>

                {/* Repot stepper */}
                <View className="bg-gray-50 rounded-2xl p-5 mb-4">
                    <AppText size="sm" font="semiBold" className="mb-1">Repot Frequency</AppText>
                    <AppText size="xs" color="gray" className="mb-4">
                        {frequencyLabel(repotDays)}
                    </AppText>
                    <View className="flex-row items-center justify-between">
                        <Pressable
                            onPress={() => setRepotDays(repotDays !== null ? Math.max(30, repotDays - 30) : 365)}
                            className="w-10 h-10 rounded-full bg-white items-center justify-center"
                            style={{ borderWidth: 1, borderColor: COLORS.border }}
                        >
                            <AppText size="md" font="bold">−</AppText>
                        </Pressable>
                        <View className="items-center">
                            <AppText size="lg" font="bold">{repotDays ?? '—'}</AppText>
                            <AppText size="xs" color="gray">{repotDays !== null ? 'days' : 'disabled'}</AppText>
                        </View>
                        <Pressable
                            onPress={() => setRepotDays((repotDays ?? 335) + 30)}
                            className="w-10 h-10 rounded-full bg-white items-center justify-center"
                            style={{ borderWidth: 1, borderColor: COLORS.border }}
                        >
                            <AppText size="md" font="bold">+</AppText>
                        </Pressable>
                    </View>
                    <Pressable onPress={() => setRepotDays(repotDays !== null ? null : 365)} className="mt-3 items-center">
                        <AppText size="xs" color="gray">
                            {repotDays !== null ? 'Disable repotting' : 'Enable (every 365 days)'}
                        </AppText>
                    </Pressable>
                </View>

                {/* Leafling tip */}
                <View
                    className="rounded-2xl p-4 mb-6 flex-row gap-3"
                    style={{ backgroundColor: '#F0F7EC' }}
                >
                    <Leaf size={20} color={COLORS.primaryDark} />
                    <View className="flex-1">
                        <AppText size="xs" font="semiBold" className="mb-1">Leafling says</AppText>
                        <AppText size="xs" color="gray">
                            Most houseplants benefit from fertilizing monthly in spring and summer. Repotting every 1–2 years keeps roots healthy.
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
                    <AppText size="sm" font="bold">← Back</AppText>
                </Pressable>
                <Pressable
                    onPress={handleSubmit}
                    disabled={submitting}
                    className="flex-1 h-[52px] rounded-xl items-center justify-center"
                    style={{ backgroundColor: submitting ? COLORS.border : COLORS.primaryDark }}
                >
                    <AppText size="sm" font="bold" color="white">
                        {submitting ? 'Saving...' : 'Finish Setup'}
                    </AppText>
                </Pressable>
            </View>
        </View>
    );
}
