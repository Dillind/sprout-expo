import AppText from '@/src/components/core/AppText';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import React from 'react';
import { View } from 'react-native';
import BaseSheet from './base-sheet';
import BaseSheetHeader from './base-sheet-header';

type Props = {
    sheetRef: React.RefObject<TrueSheet | null>;
    handleDismiss: () => void;
};

const ExampleSheet = ({ sheetRef, handleDismiss }: Props) => {
    return (
        <BaseSheet ref={sheetRef} detents={['auto', 0.4, 0.8]}>
            <BaseSheetHeader title="Example Sheet" handleClose={handleDismiss} />
            <View className="flex-1 items-center justify-center">
                <AppText size="base" font="bold" color="black">
                    Example Sheet
                </AppText>
            </View>
        </BaseSheet>
    );
};

export default ExampleSheet;
