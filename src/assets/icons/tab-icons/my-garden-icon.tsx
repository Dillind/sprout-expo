import { COLORS } from '@/src/constants/theme';
import { IconBaseProps } from '@/src/types/core';
import React from 'react';
import Svg, { Path } from 'react-native-svg';


const MyGardenIcon = ({ width = 24, height = 24, color = COLORS.black }: IconBaseProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sprout-icon lucide-sprout">
      <Path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3" color={color} />
      <Path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4" color={color} />
      <Path d="M5 21h14" color={color} />
    </Svg>
  );
};

export default MyGardenIcon;
