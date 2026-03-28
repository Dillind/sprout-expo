import { COLORS } from '@/src/constants/theme';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import AppText from '../core/AppText';

type Props = {
    title: string;
    handleClose: () => void;
};

const CLOSE_BUTTON_SIZE = 40;

const BaseSheetHeader = ({ title, handleClose }: Props) => {
    return (
        <View style={styles.container}>
            <View style={styles.spacer} />
            <AppText size="base" font="bold" color="black" style={styles.title}>
                {title}
            </AppText>
            <Pressable onPress={handleClose} style={styles.closeButton}>
                X
            </Pressable>
        </View>
    );
};

export default BaseSheetHeader;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.greyLight100,
        padding: 24,
    },
    spacer: {
        width: CLOSE_BUTTON_SIZE,
    },
    title: {
        flex: 1,
        textAlign: 'center',
    },
    closeButton: {
        width: CLOSE_BUTTON_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
