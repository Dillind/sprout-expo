import { Stack } from "expo-router";

export default function PublicLayout() {
  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  )
}