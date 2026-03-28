import { COLORS } from '@/src/constants/theme';
import { IconBaseProps } from '@/src/types/core';
import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const CalendarIcon = ({ width = 24, height = 24, color = COLORS.black }: IconBaseProps) => {
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
            className="lucide lucide-calendar-days-icon lucide-calendar-days"
        >
            <Path d="M8 2v4" color={color} />
            <Path d="M16 2v4" color={color} />
            <Rect width="18" height="18" x="3" y="4" rx="2" color={color} />
            <Path d="M3 10h18" color={color} />
            <Path d="M8 14h.01" color={color} />
            <Path d="M12 14h.01" color={color} />
            <Path d="M16 14h.01" color={color} />
            <Path d="M8 18h.01" color={color} />
            <Path d="M12 18h.01" color={color} />
            <Path d="M16 18h.01" color={color} />
        </Svg>
    );
};

export default CalendarIcon;
