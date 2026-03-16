import AppText from '@/src/components/core/AppText';
import React from 'react';
import { View } from 'react-native';

const Index = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <AppText className="text-red-500 text-sm">I am on the calendar page</AppText>
    </View>
  )
}

export default Index;
