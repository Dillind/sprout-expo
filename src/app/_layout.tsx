import AuthProvider, { useAuth } from '@/src/providers/AuthProvider';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Toaster } from 'sonner-native';
import '../../global.css';

const queryClient = new QueryClient();

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

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('plant-care', {
        name: 'Plant Care Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  }, []);

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider value={DefaultTheme}>
              <RootLayoutNav />
              <Toaster />
            </ThemeProvider>
          </AuthProvider >
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
