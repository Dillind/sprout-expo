import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import React from 'react';
import { Pressable, ScrollView } from 'react-native';

type Props = {
    locations: string[];
    selected: string | null;
    onSelect: (location: string | null) => void;
};

export default function LocationFilterTabs({ locations, selected, onSelect }: Props) {
    const tabs = ['All', ...locations];
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 12,
                gap: 8,
                flexDirection: 'row',
            }}
        >
            {tabs.map((tab) => {
                const isActive = tab === 'All' ? selected === null : selected === tab;
                return (
                    <Pressable
                        key={tab}
                        onPress={() => onSelect(tab === 'All' ? null : tab)}
                        style={{
                            paddingHorizontal: 16,
                            paddingVertical: 7,
                            borderRadius: 20,
                            backgroundColor: isActive ? COLORS.primaryDark : '#fff',
                            borderWidth: 1,
                            borderColor: isActive ? COLORS.primaryDark : COLORS.border,
                        }}
                    >
                        <AppText
                            size="xs"
                            font={isActive ? 'semiBold' : 'base'}
                            style={{ color: isActive ? '#fff' : COLORS.textSecondary }}
                        >
                            {tab}
                        </AppText>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}
