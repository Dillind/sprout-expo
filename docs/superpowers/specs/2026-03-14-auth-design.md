# Auth Design: Google, Apple & Email/Password via Supabase

**Date:** 2026-03-14
**Status:** Approved

## Overview

Replace Clerk with Supabase Auth. Implement Google (native), Apple (native), and email/password authentication with a forgot-password flow. First-time users are routed through onboarding; returning users go directly to the home tab. Onboarding completion is tracked in a `profiles` table in Supabase.

---

## Screen Structure

### Public (unauthenticated)

| Route | Description |
|---|---|
| `(public)/(auth)/index.tsx` | Entry screen — Google, Apple, and "Continue with email" buttons |
| `(public)/(auth)/sign-in.tsx` | Email + password sign-in with forgot password link |
| `(public)/(auth)/sign-up.tsx` | Email + password + confirm password sign-up |
| `(public)/(auth)/forgot-password.tsx` | Sends a password reset email via Supabase |

### Protected (authenticated)

| Route | Description |
|---|---|
| `(protected)/onboarding.tsx` | First-time onboarding flow (user is authenticated, `onboarding_completed = false`) |
| `(protected)/(tabs)/...` | Main app (existing tab layout) |

---

## Routing Logic

The root `_layout.tsx` uses Supabase session + profile state to guard routes:

1. **Not authenticated** → render `(public)`
2. **Authenticated + `onboarding_completed = false`** → render `(protected)/onboarding`
3. **Authenticated + `onboarding_completed = true`** → render `(protected)/(tabs)`

`Stack.Protected` guards (currently using Clerk) are replaced with Supabase session checks from the auth context.

---

## Data Layer

### `profiles` table

```sql
id                   uuid  PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
onboarding_completed boolean NOT NULL DEFAULT false
created_at           timestamptz NOT NULL DEFAULT now()
updated_at           timestamptz NOT NULL DEFAULT now()
```

> Note: This table will expand over time as new user profile fields are needed.

**RLS policies:**
- Users can `SELECT` their own row (`auth.uid() = id`)
- Users can `UPDATE` their own row (`auth.uid() = id`)

**Auto-create trigger:**
A Postgres trigger fires on `INSERT` to `auth.users` and creates a corresponding `profiles` row. This covers all auth methods (Google, Apple, email/password).

### Supabase Client

File: `src/lib/supabase.ts`

- Uses `@supabase/supabase-js`
- Token storage via `expo-secure-store` (already installed)
- Project URL and anon key read from environment variables

---

## Auth Provider

File: `src/providers/AuthProvider.tsx`

- Listens to `onAuthStateChange` from Supabase
- Fetches the user's `profiles` row after a session is established
- Exposes `session`, `profile`, and `isLoading` via React context
- Replaces `ClerkProvider` in the root `_layout.tsx`

---

## Native SDK Setup

### Apple Sign In
- Package: `expo-apple-authentication`
- Native capability: "Sign In with Apple" enabled in Apple Developer account and Xcode
- Flow: `AppleAuthentication.signInAsync()` → pass `identityToken` to `supabase.auth.signInWithIdToken({ provider: 'apple', token })`
- Supabase dashboard: Enable Apple provider under Authentication → Providers

### Google Sign In
- Package: `@react-native-google-signin/google-signin`
- Requires OAuth client IDs from Google Cloud Console (separate for iOS and Android)
- Client IDs added to `app.config.ts`
- Flow: `GoogleSignin.signIn()` → pass `idToken` to `supabase.auth.signInWithIdToken({ provider: 'google', token })`
- Supabase dashboard: Enable Google provider under Authentication → Providers

---

## Clerk Removal

- Remove `ClerkProvider`, `useAuth`, and all `@clerk/clerk-expo` imports
- Remove Clerk token cache
- Remove `@clerk/clerk-expo` from `package.json`

---

## External Configuration Required

| Service | Action |
|---|---|
| Google Cloud Console | Create OAuth 2.0 client IDs for iOS and Android |
| Apple Developer | Enable Sign In with Apple capability |
| Supabase Dashboard | Enable Google + Apple providers, paste credentials |
| `app.config.ts` | Add Google client IDs and Supabase env vars |
