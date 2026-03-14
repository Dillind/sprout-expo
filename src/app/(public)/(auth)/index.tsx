import { Platform, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import AppText from '@/components/core/AppText';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '@/src/lib/supabase';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

export default function AuthEntryScreen() {
  async function handleAppleSignIn() {
    const rawNonce = Math.random().toString(36).substring(2);
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce
    );
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
    if (credential.identityToken) {
      await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: rawNonce,
      });
    }
  }

  async function handleGoogleSignIn() {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (response.type === 'success') {
      await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.data.idToken!,
      });
    }
  }

  return (
    <View className="flex-1 justify-end px-6 pb-12">
      <View className="mb-10">
        <AppText className="text-3xl font-bold mb-2">Welcome to Sprout</AppText>
        <AppText className="text-base text-gray-500">Sign in to continue growing.</AppText>
      </View>
      <View className="gap-3">
        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={{ height: 52 }}
            onPress={handleAppleSignIn}
          />
        )}
        <Pressable
          onPress={handleGoogleSignIn}
          className="flex-row items-center justify-center h-[52px] rounded-xl border border-gray-200 gap-2"
        >
          <AppText className="text-base font-medium">Continue with Google</AppText>
        </Pressable>
        <Pressable
          onPress={() => router.push('/(public)/(auth)/sign-in')}
          className="flex-row items-center justify-center h-[52px] rounded-xl border border-gray-200 gap-2"
        >
          <AppText className="text-base font-medium">Continue with email</AppText>
        </Pressable>
      </View>
    </View>
  );
}
