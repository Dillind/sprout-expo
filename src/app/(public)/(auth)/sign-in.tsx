import AppText from '@/src/components/core/AppText';
import supabase from '@/src/lib/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
});

export default function SignInScreen() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleGoogleSignIn() {
        setError(null);
        setLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const { data } = await GoogleSignin.signIn();
            if (!data?.idToken) throw new Error('No ID token returned from Google');
            const { error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: data.idToken,
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message ?? 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    }

    async function handleAppleSignIn() {
        setError(null);
        setLoading(true);
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });
            if (!credential.identityToken) throw new Error('No identity token from Apple');
            const { error } = await supabase.auth.signInWithIdToken({
                provider: 'apple',
                token: credential.identityToken,
            });
            if (error) throw error;
        } catch (err: any) {
            if (err.code !== 'ERR_REQUEST_CANCELED') {
                setError(err.message ?? 'Apple sign-in failed');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 px-6 pt-24 items-center">
            <AppText className="text-3xl font-bold mb-2">Welcome to Sprout</AppText>
            <AppText className="text-base text-gray-500 mb-16 text-center">
                Sign in to keep your plants alive
            </AppText>

            {loading ? (
                <ActivityIndicator size="large" color="#2d6a4f" />
            ) : (
                <View className="w-full gap-4">
                    <GoogleSigninButton
                        size={GoogleSigninButton.Size.Wide}
                        color={GoogleSigninButton.Color.Dark}
                        onPress={handleGoogleSignIn}
                        style={{ width: '100%', height: 52 }}
                    />

                    <AppleAuthentication.AppleAuthenticationButton
                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                        cornerRadius={12}
                        style={{ width: '100%', height: 52 }}
                        onPress={handleAppleSignIn}
                    />
                </View>
            )}

            {error && (
                <AppText className="text-red-500 text-sm text-center mt-6">{error}</AppText>
            )}
        </View>
    );
}
