# React Query Integration & API Route Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix Expo Router API routes returning HTML and migrate plant data fetching to React Query hooks.

**Architecture:** Add `web.output: 'server'` to enable API route handling in the dev server, create `src/hooks/plants.ts` with `usePlants` and `useCreatePlant` hooks wrapping the existing `src/api/plants.ts` functions, then update the two affected screens to use the hooks.

**Tech Stack:** Expo Router 55, `@tanstack/react-query` (already installed + wired in `_layout.tsx`), existing `src/api/plants.ts` fetch functions.

---

## File Map

| Action | File                                          | Responsibility                                                |
| ------ | --------------------------------------------- | ------------------------------------------------------------- |
| Modify | `app.config.ts`                               | Enable server output mode for API routes                      |
| Create | `src/hooks/plants.ts`                         | `usePlants()` query hook and `useCreatePlant()` mutation hook |
| Modify | `src/app/(protected)/(tabs)/(home)/index.tsx` | Use `usePlants()` instead of manual state                     |
| Modify | `src/app/(protected)/add-plant/step-3.tsx`    | Use `useCreatePlant()` instead of manual state                |

---

## Task 1: Fix Expo Router API Routes

**Files:**

- Modify: `app.config.ts`

- [ ] **Step 1: Add `web.output: 'server'` to the config**

In `app.config.ts`, add `web: { output: 'server' }` as a top-level key in the returned object, after the `android` block:

```ts
android: {
    package: isProd ? 'au.com.sprout.android' : 'au.com.sprout.dev',
    adaptiveIcon: {
        foregroundImage: './src/assets/images/icon.png',
        backgroundColor: '#ffffff',
    },
},
web: { output: 'server' },
plugins: [
```

- [ ] **Step 2: Restart the dev server**

Stop the running Expo server and restart:

```bash
npx expo start
```

- [ ] **Step 3: Verify API routes now return JSON**

```bash
curl -s http://localhost:8081/api/plants
```

Expected output: `{"error":"Unauthorized"}` (JSON, not HTML)

- [ ] **Step 4: Commit**

```bash
git add app.config.ts
git commit -m "fix: enable Expo Router server output mode for API routes"
```

---

## Task 2: Create Plant Query Hooks

**Files:**

- Create: `src/hooks/plants.ts` (new file — `src/hooks/` directory must be created)

- [ ] **Step 1: Create `src/hooks/plants.ts`**

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { createPlant, CreatePlantPayload, listPlants } from '@/src/api/plants';

export function usePlants() {
    const { data, isLoading, isError, isRefetching, refetch } = useQuery({
        queryKey: ['plants'],
        queryFn: listPlants,
    });
    return {
        plants: data ?? [],
        isLoading,
        isError,
        isRefetching,
        refetch,
    };
}

export function useCreatePlant() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreatePlantPayload) => createPlant(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plants'] });
        },
        onError: () => {
            Alert.alert('Error', 'Failed to save your plant. Please try again.');
        },
    });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/plants.ts
git commit -m "feat: add usePlants and useCreatePlant hooks"
```

---

## Task 3: Update HomeScreen to Use `usePlants`

**Files:**

- Modify: `src/app/(protected)/(tabs)/(home)/index.tsx`

- [ ] **Step 1: Replace manual state + fetch logic with `usePlants()`**

Replace the entire `HomeScreen` function body (keep `PlantCard` and `EmptyState` components unchanged). The new `HomeScreen`:

```tsx
import { usePlants } from '@/src/hooks/plants';
import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import { router } from 'expo-router';
import { Leaf, Plus } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native';

// PlantCard and EmptyState components stay exactly as they are

export default function HomeScreen() {
    const { plants, isLoading, isError, isRefetching, refetch } = usePlants();

    return (
        <View className="flex-1" style={{ backgroundColor: COLORS.backgroundSecondary }}>
            {/* Header */}
            <View
                className="flex-row items-center justify-between px-6 pt-14 pb-4 bg-white"
                style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border }}
            >
                <AppText size="lg" font="bold">
                    My Garden
                </AppText>
                <Pressable
                    onPress={() => router.push('/(protected)/add-plant')}
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: COLORS.primaryDark }}
                >
                    <Plus size={20} color="#fff" />
                </Pressable>
            </View>

            {/* Content */}
            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : isError ? (
                <View className="flex-1 items-center justify-center px-6">
                    <AppText size="sm" color="gray" align="center" className="mb-4">
                        Failed to load plants
                    </AppText>
                    <Pressable onPress={refetch}>
                        <AppText size="sm" font="semiBold" style={{ color: COLORS.primaryDark }}>
                            Try again
                        </AppText>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={plants}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <PlantCard plant={item} />}
                    ListEmptyComponent={<EmptyState />}
                    contentContainerStyle={{ padding: 16, flexGrow: 1 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            tintColor={COLORS.primary}
                        />
                    }
                />
            )}
        </View>
    );
}
```

Note: The `Plant` type import from `@/src/api/plants` is still needed for `PlantCard`'s prop type. The `listPlants` import and all manual state imports (`useState`, `useEffect`, `useCallback`) are removed.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Verify in the running app**

Open the app to the Home screen. Plants should load. Pull down to refresh — only the `RefreshControl` spinner should show (not the full-page spinner).

- [ ] **Step 4: Commit**

```bash
git add src/app/(protected)/(tabs)/(home)/index.tsx
git commit -m "feat: use usePlants hook in HomeScreen"
```

---

## Task 4: Update AddPlantStep3 to Use `useCreatePlant`

**Files:**

- Modify: `src/app/(protected)/add-plant/step-3.tsx`

- [ ] **Step 1: Replace `submitting` state with `useCreatePlant()`**

At the top of `AddPlantStep3`, remove `const [submitting, setSubmitting] = useState(false);` and replace with:

```tsx
const { mutateAsync, isPending } = useCreatePlant();
```

Add the import at the top of the file:

```tsx
import { useCreatePlant } from '@/src/hooks/plants';
```

Remove the `createPlant` import from `@/src/api/plants` (it's no longer called directly).

- [ ] **Step 2: Replace `handleSubmit`**

Replace the entire `handleSubmit` function:

```tsx
const handleSubmit = async () => {
    if (isPending) return;
    try {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
            Alert.alert('Session expired', 'Please sign in again.');
            return;
        }

        let photoUrl: string | null = null;
        if (photoUri) {
            photoUrl = await uploadPhoto(photoUri, session.user.id);
            if (!photoUrl) {
                Alert.alert('Photo upload failed', 'Your plant will be saved without a photo.');
            }
            setPhotoUrl(photoUrl);
        }

        const plant = await mutateAsync({
            name,
            photoUrl,
            location,
            wateringDays,
            remindersEnabled,
        });

        reset();
        router.replace({
            pathname: '/(protected)/add-plant/success',
            params: { plantName: plant.name, location: plant.location },
        });
    } catch {
        // Error alert is handled by useCreatePlant's onError callback
    }
};
```

Note: The `onError` in `useCreatePlant` shows the alert when `mutateAsync` rejects. The catch block here only prevents an unhandled promise rejection — no duplicate alert.

- [ ] **Step 3: Update button disabled/label state**

Replace all occurrences of `submitting` with `isPending` in the JSX:

```tsx
disabled={isPending}
style={{ backgroundColor: isPending ? COLORS.border : COLORS.primaryDark }}
// ...
{isPending ? 'Saving...' : 'Finish Setup'}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Verify in the running app**

Add a plant through the full flow (steps 1 → 2 → 3 → submit). Should navigate to the success screen. Navigate back to home — the new plant should appear in the list.

- [ ] **Step 6: Commit**

```bash
git add src/app/(protected)/add-plant/step-3.tsx
git commit -m "feat: use useCreatePlant hook in AddPlantStep3"
```
