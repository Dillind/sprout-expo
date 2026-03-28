import { useAuth } from '@/src/providers/AuthProvider';
import { Stack } from 'expo-router';

export default function ProtectedLayout() {
    const { profile } = useAuth();

    // TODO: Add onboarding guarads back

    return (
        <Stack>
            <Stack.Protected guard={true}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack.Protected>
            <Stack.Protected guard={false}>
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            </Stack.Protected>
        </Stack>
    );
}
