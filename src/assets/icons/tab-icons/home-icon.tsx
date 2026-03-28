import { COLORS } from '@/src/constants/theme';
import { IconBaseProps } from '@/src/types/core';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

const HomeIcon = ({ width = 24, height = 24, color = COLORS.black }: IconBaseProps) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 20 18" fill="none">
            <Path
                d="M7.99778 16.3275V11.3275H11.9978V16.3275C11.9978 16.8775 12.4478 17.3275 12.9978 17.3275H15.9978C16.5478 17.3275 16.9978 16.8775 16.9978 16.3275V9.32749H18.6978C19.1578 9.32749 19.3778 8.75749 19.0278 8.45749L10.6678 0.927485C10.2878 0.587485 9.70778 0.587485 9.32778 0.927485L0.967779 8.45749C0.627779 8.75749 0.837779 9.32749 1.29778 9.32749H2.99778V16.3275C2.99778 16.8775 3.44778 17.3275 3.99778 17.3275H6.99778C7.54778 17.3275 7.99778 16.8775 7.99778 16.3275Z"
                fill={color}
            />
        </Svg>
    );
};

export default HomeIcon;
