import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import { Plant } from '@/src/types/db';
import { getPlantHealth, isWaterUrgent } from '@/src/utils/plant-health';
import React from 'react';
import { View } from 'react-native';

function StatItem({ value, label, color }: { value: number; label: string; color: string }) {
    return (
        <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12 }}>
            <AppText size="md" font="bold" style={{ color, fontSize: 22 }}>
                {value}
            </AppText>
            <AppText size="xs" color="gray" style={{ marginTop: 2 }}>
                {label}
            </AppText>
        </View>
    );
}

function Divider() {
    return <View style={{ width: 1, backgroundColor: COLORS.border, marginVertical: 10 }} />;
}

export default function GardenStatsBar({ plants }: { plants: Plant[] }) {
    const needWater = plants.filter(isWaterUrgent).length;
    const thriving = plants.filter((p) => getPlantHealth(p) === 'Thriving').length;
    return (
        <View
            style={{
                flexDirection: 'row',
                backgroundColor: '#fff',
                marginHorizontal: 16,
                marginBottom: 12,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: COLORS.border,
            }}
        >
            <StatItem value={plants.length} label="Plants" color={COLORS.textPrimary} />
            <Divider />
            <StatItem value={needWater} label="Need Water" color={COLORS.info} />
            <Divider />
            <StatItem value={thriving} label="Thriving" color={COLORS.success} />
        </View>
    );
}
