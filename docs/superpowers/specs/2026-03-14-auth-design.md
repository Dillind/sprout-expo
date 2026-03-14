# Auth Design: Google, Apple & Email/Password via Supabase

**Date:** 2026-03-14
**Status:** Approved

## Overview

Replace Clerk with Supabase Auth. Implement Google (native), Apple (native), and email/password authentication with a forgot-password flow. First-time users are routed through onboarding; returning users go directly to the home tab. Onboarding completion is tracked in a `profiles` table in Supabase.

**Package manager:** bun (all install commands use `bun add`).

---

## Screen Structure

### Public (unauthenticated)

| Route | Description |
|---|---|
| `(public)/(auth)/index.tsx` | Entry screen — Google, Apple, and "Continue with email" buttons |
| `(public)/(auth)/sign-in.tsx` | Email + password sign-in with forgot password link |
| `(public)/(auth)/sign-up.tsx` | Email + password + confirm password sign-up |
| `(public)/(auth)/forgot-password.tsx` | Sends reset email only — password update screen is out of scope for this iteration |

> `onboarding.tsx` currently lives at `(public)/(auth)/onboarding.tsx` and is **moved** to `(protected)/onboarding.tsx` — the user is authenticated when they reach it.

### Protected (authenticated)

| Route | Description |
|---|---|
| `(protected)/onboarding.tsx` | First-time onboarding (user authenticated, `onboarding_completed = false`) |
| `(protected)/(tabs)/...` | Main app (existing tab layout) |

---

## Routing Logic

### Root `_layout.tsx`

Two `Stack.Protected` groups guard top-level segments. Note: the **existing** `_layout.tsx` has the guards reversed (a bug) — this implementation corrects them:

- `guard={isSignedIn}` → shows `(protected)`
- `guard={!isSignedIn}` → shows `(public)`

`isSignedIn` is derived from the Supabase session in `AuthProvider`. The splash screen is held until **both** fonts and auth session restoration are complete (`fontsLoaded && !isLoading`). Until then the layout renders nothing.

### `(protected)/_layout.tsx`

Checks `profile.onboarding_completed` and redirects accordingly:

- `onboarding_completed = false` → `onboarding` screen
- `onboarding_completed = true` → `(tabs)`

Registers both `onboarding` and `(tabs)` as screens.

### `(public)/(auth)/_layout.tsx`

Registers four screens (removes `onboarding`, adds `index`, `sign-up`, `forgot-password`):

- `index` (entry — Expo Router handles this automatically, no explicit registration needed)
- `sign-in`
- `sign-up`
- `forgot-password`

---

## Data Layer

### `profiles` table

```sql
id                   uuid  PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
onboarding_completed boolean NOT NULL DEFAULT false
created_at           timestamptz NOT NULL DEFAULT now()
updated_at           timestamptz NOT NULL DEFAULT now()
```

> This table will expand over time as new user profile fields are needed.

**RLS policies:**
- Users can `SELECT` their own row (`auth.uid() = id`)
- Users can `UPDATE` their own row (`auth.uid() = id`)

**Triggers:**
1. `on_auth_user_created` — fires `AFTER INSERT ON auth.users`, creates a corresponding `profiles` row. Covers all auth methods.
2. `handle_updated_at` — fires `BEFORE UPDATE ON public.profiles`, sets `updated_at = now()` via the `moddatetime` extension.

### Supabase Client

File: `src/lib/supabase.ts`

- Install: `bun add @supabase/supabase-js`
- Note: `"supabase": "^2.78.1"` already in `package.json` is the **Supabase CLI** — `@supabase/supabase-js` is the JS client and must be added separately.
- Token storage via `expo-secure-store` (already installed) using a custom `ExpoSecureStoreAdapter`
- Project URL and anon key from env vars

### Environment Variables

```
# Remove
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=...

# Add
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...   # Required by Supabase to validate Google idTokens
```

---

## Auth Provider

File: `src/providers/AuthProvider.tsx`

- `AuthProvider` wraps the routing subtree in `RootLayout`, mirroring the existing `ClerkProvider` / `RootLayoutWithAuth` split
- Inner routing component (`RootLayoutWithAuth` equivalent) consumes auth context via a `useAuth` hook
- Listens to `onAuthStateChange`, fetches `profiles` row after session established
- Exposes `session`, `profile`, `isLoading`
- Splash screen hidden only when `fontsLoaded && !isLoading`

---

## Native SDK Setup

### Apple Sign In

- Install: `bun add expo-apple-authentication`
- Add `"expo-apple-authentication"` to `plugins` in `app.config.ts` (auto-configures entitlements via `expo prebuild`)
- Enable "Sign In with Apple" capability in Apple Developer account

**Flow (nonce required by Supabase):**
1. Generate a random raw nonce
2. SHA-256 hash it; pass `hashedNonce` to `AppleAuthentication.signInAsync({ nonce: hashedNonce })`
3. `supabase.auth.signInWithIdToken({ provider: 'apple', token: identityToken, nonce: rawNonce })`

### Google Sign In

- Install: `bun add @react-native-google-signin/google-signin`
- Add plugin to `app.config.ts`:
  ```js
  ['@react-native-google-signin/google-signin', { iosUrlScheme: 'com.googleusercontent.apps.<IOS_CLIENT_ID>' }]
  ```
- **Android:** download `google-services.json` from Google Cloud Console → place at project root → reference via `android.googleServicesFile` in `app.config.ts`
- **iOS:** download `GoogleService-Info.plist` from Google Cloud Console → add to Xcode project
- `GoogleSignin.configure({ webClientId: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID })` — Supabase validates against the web client ID

**Flow:**
1. `await GoogleSignin.signIn()` → get `idToken`
2. `supabase.auth.signInWithIdToken({ provider: 'google', token: idToken })`

> `expo-auth-session` and `expo-web-browser` (already installed) are **not used** in this implementation.

---

## Clerk Removal

- Remove all `@clerk/clerk-expo` imports and `ClerkProvider`
- `bun remove @clerk/clerk-expo`
- Remove `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` from `.env`

---

## External Configuration Required

| Service | Action |
|---|---|
| Google Cloud Console | Create Web, iOS, and Android OAuth 2.0 client IDs; download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) |
| Apple Developer | Enable Sign In with Apple capability |
| Supabase Dashboard | Enable Google + Apple providers, paste credentials |
| `.env` | Replace Clerk key with Supabase URL, anon key, and Google client IDs (iOS, Android, Web) |
| `app.config.ts` | Add plugin entries for `expo-apple-authentication` and `@react-native-google-signin/google-signin`; reference `google-services.json` |
