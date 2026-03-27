import { COLORS } from '@/src/constants/theme';
import { IconBaseProps } from '@/src/types/core';
import React from 'react';
import { Circle, Path, Svg } from 'react-native-svg';

const ProfileIcon = ({ width = 24, height = 24, color = COLORS.black }: IconBaseProps) => {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-user-icon lucide-user"
        >
            <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" color={color} />
            <Circle cx="12" cy="7" r="4" color={color} />
        </Svg>
    );
};

export default ProfileIcon;
