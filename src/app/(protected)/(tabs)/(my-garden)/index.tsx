import MainButton from '@/src/components/core/MainButton';
import supabase from '@/src/lib/supabase';
import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

const Index = () => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    if (router.canDismiss()) router.dismissAll();
    router.push('/sign-in');
  }

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-red-500">I am on the my garden page</Text>
      <MainButton variant={"primary"} text="Sign out" onPress={handleSignOut} />
    </View>
  )
}

export default Index;
