import supabase from '@/src/lib/supabase';
import { router } from 'expo-router';
import React from 'react';
import { Button, Text, View } from 'react-native';

const OnboardingScreen = () => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/(public)/(auth)/sign-in');
  }
  return (
    <View className='flex-1 justify-center items-center'>
      <Text>I am on the onboarding page</Text>
      <Button title="Sign out" onPress={handleSignOut} />
    </View>
  )
}

export default OnboardingScreen;

