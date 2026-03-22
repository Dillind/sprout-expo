import React, { useState } from 'react';
import {
    View, TextInput, TouchableOpacity, Pressable,
    Alert, ActivityIndicator, Image, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/src/components/core/AppText';
import { useAddPlantStore } from '@/src/stores/add-plant.store';
import { COLORS } from '@/src/constants/theme';

export default function AddPlantStep1() {
    const { name, photoUri, setName, setPhotoUri } = useAddPlantStore();
    const [loading, setLoading] = useState(false);

    const handlePhotoPress = () => {
        Alert.alert('Add a Photo', 'Choose how to add your plant photo', [
            { text: 'Take Photo', onPress: handleCamera },
            { text: 'Choose from Library', onPress: handleLibrary },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const handleCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Camera access is required to take a photo.');
            return;
        }
        setLoading(true);
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true, aspect: [1, 1], quality: 0.8,
        });
        setLoading(false);
        if (!result.canceled) setPhotoUri(result.assets[0].uri);
    };

    const handleLibrary = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Photo library access is required.');
            return;
        }
        setLoading(true);
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true, aspect: [1, 1], quality: 0.8,
        });
        setLoading(false);
        if (!result.canceled) setPhotoUri(result.assets[0].uri);
    };

    const canProceed = name.trim().length > 0;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                <Pressable onPress={() => router.back()} className="pt-4 mb-3">
                    <ChevronLeft size={24} color={COLORS.textPrimary} />
                </Pressable>

                {/* Progress */}
                <AppText size="xs" color="gray" className="mb-2 tracking-widest">STEP 1 OF 3</AppText>
                <View className="flex-row gap-1.5 mb-6">
                    <View className="flex-1 h-1 rounded-full bg-green-700" />
                    <View className="flex-1 h-1 rounded-full bg-gray-200" />
                    <View className="flex-1 h-1 rounded-full bg-gray-200" />
                </View>

                <AppText size="md" font="bold" className="mb-6">What are we{'\n'}growing?</AppText>

                {/* Photo picker */}
                <TouchableOpacity
                    onPress={handlePhotoPress}
                    className="border-2 border-dashed border-gray-200 rounded-2xl items-center justify-center mb-6"
                    style={{ height: 200 }}
                    activeOpacity={0.7}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.primary} />
                    ) : photoUri ? (
                        <Image source={{ uri: photoUri }} className="w-full h-full rounded-2xl" resizeMode="cover" />
                    ) : (
                        <View className="items-center gap-2">
                            <ImagePlus size={36} color={COLORS.primary} />
                            <AppText size="sm" font="semiBold">Add a photo</AppText>
                            <AppText size="xs" color="gray">Tap here to upload a photo of your plant</AppText>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Plant name */}
                <AppText size="sm" font="semiBold" className="mb-2">Plant Name</AppText>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g., My Fiddle Leaf Fig"
                    className="h-[52px] border border-gray-200 rounded-xl px-4 mb-8"
                    style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: COLORS.textPrimary }}
                    placeholderTextColor={COLORS.textTertiary}
                />
            </ScrollView>

            <View className="px-6 pb-8">
                <Pressable
                    onPress={() => router.push('/(protected)/add-plant/step-2')}
                    disabled={!canProceed}
                    className="h-[52px] rounded-xl items-center justify-center"
                    style={{ backgroundColor: canProceed ? COLORS.primaryDark : COLORS.border }}
                >
                    <AppText size="sm" font="bold" color="white">Next →</AppText>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
