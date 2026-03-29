import { Plant } from '@/src/types/db';
import { COLORS } from '@/src/constants/theme';
import { Leaf } from 'lucide-react-native';
import { View } from 'react-native';
import AppText from '../../core/AppText';

type Props = {
    plant: Plant;
};

function PlantCard({ plant }: Props) {
    return (
        <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center gap-4 border border-amber-300">
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
                Every {plant.watering_days}d
            </AppText>
        </View>
    );
}

export default PlantCard;
