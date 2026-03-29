import useUserStore from '@/src/stores/user-store';
import { Stack } from 'expo-router';

export default function ProtectedLayout() {
    const { user } = useUserStore();

    // TODO: Add onboarding guards back (use user.onboarding_completed)

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
