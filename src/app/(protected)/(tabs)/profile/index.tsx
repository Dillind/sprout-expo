import AppText from '@/src/components/core/AppText';
import React from 'react';
import { View } from 'react-native';

export default function HomeScreen() {
    return (
        <View className="flex-1">
            <AppText size="lg" font="bold">
                Profile
            </AppText>
        </View>
    );
}
