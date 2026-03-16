import { COLORS } from '@/src/constants/theme';
import { IconBaseProps } from '@/src/types/core';
import React from 'react';
import { Path, Svg } from 'react-native-svg';

const ExampleIcon = ({ width = 24, height = 24, color = COLORS.black }: IconBaseProps) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
            <Path
                d="M8 1.33333C4.318 1.33333 1.33333 4.318 1.33333 8C1.33333 11.682 4.318 14.6667 8 14.6667C11.682 14.6667 14.6667 11.682 14.6667 8C14.6667 4.318 11.682 1.33333 8 1.33333Z"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M6 6H10"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M6 10H10"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
};

export default ExampleIcon;
