import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import { useCreatePlant } from '@/src/hooks/plants';
import supabase from '@/src/lib/supabase';
import { useAddPlantStore } from '@/src/stores/add-plant.store';
import { router } from 'expo-router';
import { Leaf } from 'lucide-react-native';
import React from 'react';
import { Alert, Pressable, ScrollView, Switch, View } from 'react-native';

function frequencyLabel(days: number): string {
    if (days === 1) return 'Every day';
    if (days === 7) return 'Every week';
    if (days === 14) return 'Every 2 weeks';
    if (days === 30) return 'Every month';
    return `Every ${days} days`;
}

async function uploadPhoto(uri: string, userId: string): Promise<string | null> {
    // Extract extension safely, handling query strings in URI
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

export default function AddPlantStep3() {
    const {
        name, photoUri, location,
        wateringDays, remindersEnabled,
        setWateringDays, setRemindersEnabled, setPhotoUrl, reset,
    } = useAddPlantStore();
    const { mutateAsync, isPending } = useCreatePlant();

    const handleSubmit = async () => {
        if (isPending) return;
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

            const plant = await mutateAsync({
                name,
                photoUrl,
                location,
                wateringDays,
                remindersEnabled,
            });

            reset();
            router.replace({
                pathname: '/(protected)/add-plant/success',
                params: { plantName: plant.name, location: plant.location },
            });
        } catch {
            // Error alert handled by useCreatePlant's onError callback
        }
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {/* Progress */}
                <AppText size="xs" color="gray" className="pt-4 mb-2 tracking-widest">STEP 3 OF 3</AppText>
                <View className="flex-row gap-1.5 mb-6">
                    <View className="flex-1 h-1 rounded-full bg-green-700" />
                    <View className="flex-1 h-1 rounded-full bg-green-700" />
                    <View className="flex-1 h-1 rounded-full bg-green-700" />
                </View>

                <AppText size="md" font="bold" className="mb-6">Care{'\n'}Schedule</AppText>

                {/* Watering stepper */}
                <View className="bg-gray-50 rounded-2xl p-5 mb-4">
                    <AppText size="sm" font="semiBold" className="mb-4">Watering Frequency</AppText>
                    <View className="flex-row items-center justify-between">
                        <Pressable
                            onPress={() => setWateringDays(Math.max(1, wateringDays - 1))}
                            className="w-10 h-10 rounded-full bg-white items-center justify-center"
                            style={{ borderWidth: 1, borderColor: COLORS.border }}
                        >
                            <AppText size="md" font="bold">−</AppText>
                        </Pressable>
                        <View className="items-center">
                            <AppText size="lg" font="bold">{wateringDays}</AppText>
                            <AppText size="xs" color="gray">days</AppText>
                        </View>
                        <Pressable
                            onPress={() => setWateringDays(Math.min(90, wateringDays + 1))}
                            className="w-10 h-10 rounded-full bg-white items-center justify-center"
                            style={{ borderWidth: 1, borderColor: COLORS.border }}
                        >
                            <AppText size="md" font="bold">+</AppText>
                        </Pressable>
                    </View>
                    <AppText size="xs" color="gray" align="center" className="mt-2">
                        {frequencyLabel(wateringDays)}
                    </AppText>
                </View>

                {/* Reminders toggle */}
                <View className="bg-gray-50 rounded-2xl p-5 mb-4 flex-row items-center justify-between">
                    <View>
                        <AppText size="sm" font="semiBold">Watering Reminders</AppText>
                        <AppText size="xs" color="gray">Get notified when it&apos;s time to water</AppText>
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
                        <AppText size="xs" font="semiBold" className="mb-1">Leafling says</AppText>
                        <AppText size="xs" color="gray">
                            Most houseplants thrive with watering every 7–14 days. Start with 7 and adjust based on your plant&apos;s needs.
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
                    disabled={isPending}
                    className="flex-1 h-[52px] rounded-xl items-center justify-center"
                    style={{ backgroundColor: isPending ? COLORS.border : COLORS.primaryDark }}
                >
                    <AppText size="sm" font="bold" color="white">
                        {isPending ? 'Saving...' : 'Finish Setup'}
                    </AppText>
                </Pressable>
            </View>
        </View>
    );
}
