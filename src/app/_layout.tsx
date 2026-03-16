import AuthProvider, { useAuth } from '@/src/providers/AuthProvider';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import '../../global.css';

SplashScreen.preventAutoHideAsync();

// eslint-disable-next-line @typescript-eslint/no-require-imports
if (__DEV__) require('../../ReactotronConfig');

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const [fontsLoaded, fontsError] = useFonts({
    'Inter-Bold': require('@/src/assets/fonts/Inter-Bold.ttf'),
    'Inter-SemiBold': require('@/src/assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Medium': require('@/src/assets/fonts/Inter-Medium.ttf'),
    'Inter-Regular': require('@/src/assets/fonts/Inter-Regular.ttf'),
    'Inter-Light': require('@/src/assets/fonts/Inter-Light.ttf'),
  });

  const ready = (fontsLoaded || !!fontsError) && !isLoading;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(public)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <KeyboardProvider>
        <ThemeProvider value={DefaultTheme}>
          <RootLayoutNav />
        </ThemeProvider>
      </KeyboardProvider>
    </AuthProvider>
  );
}
