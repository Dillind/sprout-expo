import { COLORS } from '@/src/constants/theme';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

type Props = {
    style?: StyleProp<ViewStyle>;
    width?: number;
    height: number;
    borderRadius?: number;
    marginBottom?: number;
    marginTop?: number;
    marginHorizontal?: number;
};

const MainSkeleton = ({
    marginTop,
    marginHorizontal,
    style,
    height,
    width,
    borderRadius = 8,
    marginBottom,
}: Props) => {
    return (
        <MotiView
            transition={{
                type: 'timing',
            }}
            style={[{ marginBottom, marginTop, marginHorizontal }, style]}
        >
            <Skeleton
                colorMode="light"
                width={width ? width : '100%'}
                height={height}
                colors={[COLORS.white, COLORS.greyLight100]}
                radius={borderRadius}
            />
        </MotiView>
    );
};

export { MainSkeleton };
