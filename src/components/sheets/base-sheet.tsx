import { COLORS } from '@/src/constants/theme';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import React, { forwardRef } from 'react';
import { StyleSheet } from 'react-native';

type BaseSheetProps = Omit<React.ComponentProps<typeof TrueSheet>, 'children'> & {
    children: React.ReactNode;
};

const BaseSheet = forwardRef<TrueSheet, BaseSheetProps>(
    ({ children, detents = ['auto', 0.6, 1], ...props }, ref) => {
        return (
            <TrueSheet
                ref={ref}
                detents={detents}
                backgroundColor={COLORS.white}
                style={styles.content}
                {...props}
            >
                {children}
            </TrueSheet>
        );
    },
);

BaseSheet.displayName = 'BaseSheet';

export default BaseSheet;

const styles = StyleSheet.create({
    content: {
        flexGrow: 1,
        alignSelf: 'stretch',
    },
});
