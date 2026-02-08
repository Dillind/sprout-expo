import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "../global.css";

export function RootLayoutWithAuth() {
  // TODO: Check if user is logged in with clerk hook auth once implemented.
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  return (
    <Stack>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(public)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <KeyboardProvider>
        {/* TODO: add dark + light mode support later */}
        <ThemeProvider value={DefaultTheme}>
          <RootLayoutWithAuth />
        </ThemeProvider>
      </KeyboardProvider>
    </ClerkProvider>
  )
}
