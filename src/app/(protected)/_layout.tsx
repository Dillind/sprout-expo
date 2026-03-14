import { useAuth } from '@/src/providers/AuthProvider';
import { Stack } from 'expo-router';

export default function ProtectedLayout() {
  const { profile } = useAuth();

  return (
    <Stack>
      <Stack.Protected guard={profile?.onboarding_completed === true}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={profile?.onboarding_completed !== true}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}