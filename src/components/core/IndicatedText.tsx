import RequiredIndicatorIcon from '@/src/assets/icons/required-indicator-icon';
import AppText from '@/src/components/core/AppText';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  marginTop?: number;
  marginBottom?: number;
  text: string;
};

const IndicatedText = ({ marginBottom, marginTop, text }: Props) => {
  return (
    <View className="flex-row" style={{ marginTop, marginBottom }}>
      <AppText size="base" font="bold" color="black">
        {text}
      </AppText>
      <RequiredIndicatorIcon />
    </View>
  );
};

export default IndicatedText;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
});
