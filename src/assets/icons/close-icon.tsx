import { COLORS } from '@/src/constants/theme';
import { IconBaseProps } from '@/src/types/core';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

const CloseIcon = ({ width = 14, height = 14, color = COLORS.black }: IconBaseProps) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 14 14" fill="none">
            <Path
                d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
                fill={color}
            />
        </Svg>
    );
};

export default CloseIcon;
