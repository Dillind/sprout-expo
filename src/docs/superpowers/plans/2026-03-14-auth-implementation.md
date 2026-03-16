# Auth Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Clerk with Supabase Auth, implementing native Google + Apple OAuth and email/password authentication with onboarding routing.

**Architecture:** `AuthProvider` wraps the app, exposes `session`/`profile`/`isLoading` from Supabase. Root layout uses `Stack.Protected` guards based on session state. Protected layout redirects based on `profile.onboarding_completed`.

**Tech Stack:** `@supabase/supabase-js`, `expo-apple-authentication`, `expo-crypto`, `@react-native-google-signin/google-signin`, `expo-secure-store` (already installed), Expo Router v55, bun.

**Spec:** `docs/superpowers/specs/2026-03-14-auth-design.md`

---

## Chunk 1: Foundation

### Task 1: Fix Expo Router root + install packages

**Files:**
- Modify: `app.config.ts`
- Modify: `package.json` (via bun commands)

> **Note:** Clerk source removal happens in Task 6 alongside the root layout replacement. Do NOT run `bun remove @clerk/clerk-expo` here — the existing `_layout.tsx` still imports it and the type-check would fail.

- [ ] **Step 1: Update `app.config.ts` — add `root: 'src'` to expo-router plugin**

Replace `'expo-router'` with `['expo-router', { root: 'src' }]` in the plugins array. The full plugins array should be:

```ts
plugins: [
    ['expo-router', { root: 'src' }],
    'expo-font',
    'expo-image',
    [
        'expo-image-picker',
        {
            photosPermission: '$(PRODUCT_NAME) accesses your photos to let you share them.',
            cameraPermission:
                '$(PRODUCT_NAME) accesses your camera to let you take photos.',
        },
    ],
    [
        'expo-secure-store',
        {
            configureAndroidBackup: true,
        },
    ],
],
```

- [ ] **Step 2: Install Supabase JS client and auth packages**

```bash
bun add @supabase/supabase-js expo-apple-authentication expo-crypto @react-native-google-signin/google-signin
```

Expected: packages added to `package.json`, `bun.lock` updated.

> Note: `expo-secure-store` is already installed — do not add it again.

- [ ] **Step 3: Verify type-check passes**

```bash
bun run type-check
```

Expected: no errors. Clerk is still installed and `_layout.tsx` still imports it — that is intentional at this stage.

- [ ] **Step 4: Commit**

```bash
git add app.config.ts package.json bun.lock
git commit -m "chore: add Supabase auth packages and fix expo-router root"
```

---

### Task 2: Update environment variables

**Files:**
- Modify: `.env`
- Modify or create: `.env.example`

- [ ] **Step 1: Update `.env` with Supabase values**

Remove `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`. Add:

```
EXPO_PUBLIC_SUPABASE_URL=<from Supabase dashboard → Settings → API>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<from Supabase dashboard → Settings → API>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<numeric portion of iOS client ID, e.g. 123456789-abc>
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<numeric portion of Android client ID>
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<Web client ID — used by Supabase to validate tokens>
EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME=<REVERSED_CLIENT_ID from GoogleService-Info.plist, e.g. com.googleusercontent.apps.123456789-abc>
```

> ⚠️ `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` can be retrieved immediately via `mcp__supabase__get_project_url` and `mcp__supabase__get_publishable_keys`. Google values require external setup — leave as placeholders until configured.

> ⚠️ Do NOT commit `.env` to git — it contains secrets.

- [ ] **Step 2: Update `.env.example`**

Create or update `.env.example` with placeholder keys (no values):

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME=
```

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: update env example for Supabase auth"
```

---

### Task 3: Create Supabase client

**Files:**
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Create `src/lib/supabase.ts`**

```typescript
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

- [ ] **Step 2: Verify type-check**

```bash
bun run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add Supabase client with SecureStore adapter"
```

---

## Chunk 2: Database Migration

### Task 4: Apply Supabase migration

**Files:**
- No local files (applied via Supabase MCP)

- [ ] **Step 1: Apply migration using `mcp__supabase__apply_migration`**

Migration name: `create_profiles_table`

SQL:
```sql
-- Enable moddatetime extension for auto-updating updated_at
create extension if not exists moddatetime schema extensions;

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS: users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- RLS: users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at on row modification
create trigger handle_updated_at
  before update on public.profiles
  for each row execute procedure extensions.moddatetime('updated_at');
```

- [ ] **Step 2: Verify migration applied**

Use `mcp__supabase__list_tables` with `schemas: ["public"]` — confirm `profiles` table appears.

- [ ] **Step 3: Verify RLS policies**

Use `mcp__supabase__execute_sql`:
```sql
select policyname, cmd from pg_policies where tablename = 'profiles';
```

Expected: two rows — `Users can view own profile` (SELECT) and `Users can update own profile` (UPDATE).

---

## Chunk 3: Auth Core

### Task 5: Create AuthProvider

**Files:**
- Create: `src/providers/AuthProvider.tsx`

> Depends on: Task 3 (`src/lib/supabase.ts` must exist)

- [ ] **Step 1: Create `src/providers/AuthProvider.tsx`**

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';

export type Profile = {
  id: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(data);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ session, profile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 2: Verify type-check**

```bash
bun run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/providers/AuthProvider.tsx
git commit -m "feat: add Supabase AuthProvider with session and profile state"
```

---

### Task 6: Replace Clerk in root layout + remove Clerk package

**Files:**
- Modify: `src/app/_layout.tsx`

> This task removes all Clerk usage. Replace the source file first, then remove the package — this ensures the type-check passes after both changes.

- [ ] **Step 1: Replace `src/app/_layout.tsx`**

```typescript
import { AuthProvider, useAuth } from '@/src/providers/AuthProvider';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import '../global.css';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const [fontsLoaded, fontsError] = useFonts({
    'Inter-Bold': require('@/assets/fonts/Inter-Bold.ttf'),
    'Inter-SemiBold': require('@/assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Medium': require('@/assets/fonts/Inter-Medium.ttf'),
    'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
    'Inter-Light': require('@/assets/fonts/Inter-Light.ttf'),
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
```

> Note: The `global.css` import uses a relative path (`'../global.css'`) because `global.css` lives at `src/global.css` and this file is at `src/app/_layout.tsx`.

- [ ] **Step 2: Remove Clerk package**

```bash
bun remove @clerk/clerk-expo
```

- [ ] **Step 3: Verify type-check**

```bash
bun run type-check
```

Expected: no errors. Clerk is fully gone.

- [ ] **Step 4: Commit**

```bash
git add src/app/_layout.tsx package.json bun.lock
git commit -m "feat: replace ClerkProvider with Supabase AuthProvider in root layout"
```

---

### Task 7: Update protected layout with onboarding routing

**Files:**
- Modify: `src/app/(protected)/_layout.tsx`
- Move: `src/app/(public)/(auth)/onboarding.tsx` → `src/app/(protected)/onboarding.tsx`
- Modify: `src/app/(public)/(auth)/_layout.tsx`

- [ ] **Step 1: Update `src/app/(protected)/_layout.tsx`**

```typescript
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
```

- [ ] **Step 2: Move onboarding screen from public to protected**

```bash
mv "src/app/(public)/(auth)/onboarding.tsx" "src/app/(protected)/onboarding.tsx"
```

- [ ] **Step 3: Update `src/app/(public)/(auth)/_layout.tsx`**

```typescript
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
    </Stack>
  );
}
```

- [ ] **Step 4: Verify type-check**

```bash
bun run type-check
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(protected)/_layout.tsx" "src/app/(protected)/onboarding.tsx" "src/app/(public)/(auth)/_layout.tsx"
git commit -m "feat: add onboarding routing to protected layout, move onboarding screen"
```

---

## Chunk 4: Auth Screens

### Task 8: Create entry screen (index)

**Files:**
- Rename + replace: `src/app/(public)/(auth)/sign-in.tsx` → `src/app/(public)/(auth)/index.tsx`

> The current `sign-in.tsx` is a placeholder. Rename it to `index.tsx` (the new entry screen), then create a fresh `sign-in.tsx` in Task 9.

- [ ] **Step 1: Rename `sign-in.tsx` to `index.tsx`**

```bash
mv "src/app/(public)/(auth)/sign-in.tsx" "src/app/(public)/(auth)/index.tsx"
```

- [ ] **Step 2: Replace the content of `src/app/(public)/(auth)/index.tsx`**

```typescript
import { Platform, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import AppText from '@/components/core/AppText';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '@/src/lib/supabase';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

export default function AuthEntryScreen() {
  async function handleAppleSignIn() {
    const rawNonce = Math.random().toString(36).substring(2);
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce
    );

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    if (credential.identityToken) {
      await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: rawNonce,
      });
    }
  }

  async function handleGoogleSignIn() {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (response.type === 'success') {
      await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.data.idToken!,
      });
    }
  }

  return (
    <View className="flex-1 justify-end px-6 pb-12">
      <View className="mb-10">
        <AppText className="text-3xl font-bold mb-2">Welcome to Sprout</AppText>
        <AppText className="text-base text-gray-500">
          Sign in to continue growing.
        </AppText>
      </View>

      <View className="gap-3">
        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={{ height: 52 }}
            onPress={handleAppleSignIn}
          />
        )}

        <Pressable
          onPress={handleGoogleSignIn}
          className="flex-row items-center justify-center h-[52px] rounded-xl border border-gray-200 gap-2"
        >
          <AppText className="text-base font-medium">Continue with Google</AppText>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(public)/(auth)/sign-in')}
          className="flex-row items-center justify-center h-[52px] rounded-xl border border-gray-200 gap-2"
        >
          <AppText className="text-base font-medium">Continue with email</AppText>
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 3: Verify type-check**

```bash
bun run type-check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(public)/(auth)/index.tsx"
git commit -m "feat: add auth entry screen with Google and Apple sign-in"
```

---

### Task 9: Create email sign-in screen

**Files:**
- Create: `src/app/(public)/(auth)/sign-in.tsx`

- [ ] **Step 1: Create `src/app/(public)/(auth)/sign-in.tsx`**

```typescript
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AppText from '@/components/core/AppText';
import { supabase } from '@/src/lib/supabase';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function SignInScreen() {
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) setError(error.message);
  }

  return (
    <View className="flex-1 px-6 pt-16">
      <Pressable onPress={() => router.back()} className="mb-8">
        <AppText className="text-base text-gray-500">← Back</AppText>
      </Pressable>

      <AppText className="text-2xl font-bold mb-8">Sign in</AppText>

      <View className="gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <View>
              <TextInput
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                className="h-[52px] border border-gray-200 rounded-xl px-4 text-base"
              />
              {errors.email && (
                <AppText className="text-red-500 text-sm mt-1">{errors.email.message}</AppText>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <View>
              <TextInput
                placeholder="Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                className="h-[52px] border border-gray-200 rounded-xl px-4 text-base"
              />
              {errors.password && (
                <AppText className="text-red-500 text-sm mt-1">{errors.password.message}</AppText>
              )}
            </View>
          )}
        />

        {error && (
          <AppText className="text-red-500 text-sm text-center">{error}</AppText>
        )}

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="h-[52px] bg-green-700 rounded-xl items-center justify-center"
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <AppText className="text-white font-semibold text-base">Sign in</AppText>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push('/(public)/(auth)/forgot-password')}
          className="items-center"
        >
          <AppText className="text-sm text-gray-500">Forgot password?</AppText>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(public)/(auth)/sign-up')}
          className="items-center"
        >
          <AppText className="text-sm text-gray-500">
            Don't have an account?{' '}
            <AppText className="text-green-700 font-medium">Sign up</AppText>
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Verify type-check**

```bash
bun run type-check
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/(public)/(auth)/sign-in.tsx"
git commit -m "feat: add email sign-in screen with validation"
```

---

### Task 10: Create sign-up screen

**Files:**
- Create: `src/app/(public)/(auth)/sign-up.tsx`

- [ ] **Step 1: Create `src/app/(public)/(auth)/sign-up.tsx`**

```typescript
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AppText from '@/components/core/AppText';
import { supabase } from '@/src/lib/supabase';
import { useState } from 'react';

const schema = z
  .object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function SignUpScreen() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError(null);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <View className="flex-1 px-6 pt-16 items-center justify-center">
        <AppText className="text-2xl font-bold mb-4">Check your email</AppText>
        <AppText className="text-base text-gray-500 text-center">
          We sent a confirmation link to your email. Click it to activate your account.
        </AppText>
        <Pressable onPress={() => router.replace('/(public)/(auth)')} className="mt-8">
          <AppText className="text-green-700 font-medium">Back to sign in</AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 px-6 pt-16">
      <Pressable onPress={() => router.back()} className="mb-8">
        <AppText className="text-base text-gray-500">← Back</AppText>
      </Pressable>

      <AppText className="text-2xl font-bold mb-8">Create account</AppText>

      <View className="gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <View>
              <TextInput
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                className="h-[52px] border border-gray-200 rounded-xl px-4 text-base"
              />
              {errors.email && (
                <AppText className="text-red-500 text-sm mt-1">{errors.email.message}</AppText>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <View>
              <TextInput
                placeholder="Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                className="h-[52px] border border-gray-200 rounded-xl px-4 text-base"
              />
              {errors.password && (
                <AppText className="text-red-500 text-sm mt-1">{errors.password.message}</AppText>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <View>
              <TextInput
                placeholder="Confirm password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                className="h-[52px] border border-gray-200 rounded-xl px-4 text-base"
              />
              {errors.confirmPassword && (
                <AppText className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </AppText>
              )}
            </View>
          )}
        />

        {error && (
          <AppText className="text-red-500 text-sm text-center">{error}</AppText>
        )}

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="h-[52px] bg-green-700 rounded-xl items-center justify-center"
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <AppText className="text-white font-semibold text-base">Create account</AppText>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push('/(public)/(auth)/sign-in')}
          className="items-center"
        >
          <AppText className="text-sm text-gray-500">
            Already have an account?{' '}
            <AppText className="text-green-700 font-medium">Sign in</AppText>
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Verify type-check**

```bash
bun run type-check
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/(public)/(auth)/sign-up.tsx"
git commit -m "feat: add email sign-up screen with confirmation flow"
```

---

### Task 11: Create forgot-password screen

**Files:**
- Create: `src/app/(public)/(auth)/forgot-password.tsx`

- [ ] **Step 1: Create `src/app/(public)/(auth)/forgot-password.tsx`**

```typescript
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AppText from '@/components/core/AppText';
import { supabase } from '@/src/lib/supabase';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <View className="flex-1 px-6 pt-16 items-center justify-center">
        <AppText className="text-2xl font-bold mb-4">Email sent</AppText>
        <AppText className="text-base text-gray-500 text-center">
          Check your inbox for a password reset link.
        </AppText>
        <Pressable onPress={() => router.back()} className="mt-8">
          <AppText className="text-green-700 font-medium">Back to sign in</AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 px-6 pt-16">
      <Pressable onPress={() => router.back()} className="mb-8">
        <AppText className="text-base text-gray-500">← Back</AppText>
      </Pressable>

      <AppText className="text-2xl font-bold mb-2">Reset password</AppText>
      <AppText className="text-base text-gray-500 mb-8">
        Enter your email and we'll send you a reset link.
      </AppText>

      <View className="gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <View>
              <TextInput
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                className="h-[52px] border border-gray-200 rounded-xl px-4 text-base"
              />
              {errors.email && (
                <AppText className="text-red-500 text-sm mt-1">{errors.email.message}</AppText>
              )}
            </View>
          )}
        />

        {error && (
          <AppText className="text-red-500 text-sm text-center">{error}</AppText>
        )}

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="h-[52px] bg-green-700 rounded-xl items-center justify-center"
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <AppText className="text-white font-semibold text-base">Send reset link</AppText>
          )}
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Verify type-check**

```bash
bun run type-check
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/(public)/(auth)/forgot-password.tsx"
git commit -m "feat: add forgot-password screen"
```

---

## Chunk 5: Native SDK Config

### Task 12: Update app.config.ts with native SDK plugins

**Files:**
- Modify: `app.config.ts`

- [ ] **Step 1: Add Apple Sign In plugin**

Add `'expo-apple-authentication'` to the plugins array in `app.config.ts` (after the existing entries).

- [ ] **Step 2: Add Google Sign In plugin**

Add the Google Sign In plugin after the Apple entry:

```ts
[
    '@react-native-google-signin/google-signin',
    {
        iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME,
    },
],
```

> `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME` should hold the `REVERSED_CLIENT_ID` value from `GoogleService-Info.plist` — it looks like `com.googleusercontent.apps.123456789-abc`. This is a static string, not a computed value.

- [ ] **Step 3: Add `googleServicesFile` to the android block**

Inside the existing `android: { ... }` block, add one line:

```ts
googleServicesFile: './google-services.json',
```

> `google-services.json` must be downloaded from Google Cloud Console and placed at the project root before Android builds will work.

- [ ] **Step 4: Verify type-check**

```bash
bun run type-check
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app.config.ts
git commit -m "feat: add expo-apple-authentication and Google Sign In plugin config"
```

---

### Task 13: Run prebuild to apply native config

> ⚠️ Skip this task until Google and Apple credentials are fully configured (`.env` values filled in, `google-services.json` placed at project root, `GoogleService-Info.plist` added to Xcode project).

- [ ] **Step 1: Run prebuild for iOS**

```bash
bun run prebuild:ios
```

Expected: Xcode project updated with Sign In with Apple entitlement and Google URL scheme.

- [ ] **Step 2: Run prebuild for Android**

```bash
bun run prebuild:android
```

Expected: Android project updated with Google Services config.

- [ ] **Step 3: Commit updated native files**

```bash
git add ios/ android/
git commit -m "chore: regenerate native projects with auth SDK configs"
```

---

## External Setup Checklist (Manual — complete before Task 13)

- [ ] **Supabase Dashboard** → Authentication → Providers → Enable **Google**, paste Web Client ID + Secret
- [ ] **Supabase Dashboard** → Authentication → Providers → Enable **Apple**, paste Service ID + Secret Key
- [ ] **Google Cloud Console** → Create OAuth 2.0 client IDs for Web, iOS, and Android → paste into `.env`
- [ ] **Google Cloud Console** → Download `google-services.json` → place at project root
- [ ] **Google Cloud Console** → Download `GoogleService-Info.plist` → add to Xcode project, copy `REVERSED_CLIENT_ID` value into `.env` as `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME`
- [ ] **Apple Developer** → App ID → enable **Sign In with Apple** capability
