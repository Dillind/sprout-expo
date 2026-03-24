# React Query Integration & API Route Fix

**Date:** 2026-03-24

## Problem

Two issues to resolve:

1. Expo Router API routes return HTML instead of JSON because `web.output: 'server'` is missing from `app.config.ts`. The Metro dev server serves the web bundle for all paths without this setting.
2. Data fetching in screens uses manual `useState`/`useEffect`/`useCallback` boilerplate. React Query is already installed and `QueryClientProvider` is already wired in `_layout.tsx`, but no hooks exist yet.

## Changes

### 1. `app.config.ts` — Add server output mode

Add `web: { output: 'server' }` as a top-level property in the returned `ExpoConfig` object, alongside the existing `ios`, `android`, `plugins`, and `extra` keys. Do not spread `config.web`. Example placement:

```ts
return {
  ...config,
  name: appName,
  // ... other fields
  ios: { ... },
  android: { ... },
  web: { output: 'server' },  // <-- add here
  plugins: [ ... ],
  extra: { ... },
};
```

Requires a dev server restart after this change.

### 2. `src/hooks/plants.ts` — New file (new `src/hooks/` directory)

The `src/hooks/` directory does not yet exist and must be created. Two hooks:

**`usePlants()`**
- Calls `listPlants()` from `src/api/plants.ts`
- Query key: `['plants']`
- Returns `{ plants, isLoading, isError, isRefetching, refetch }` where `plants` is the renamed `data` field (typed as `Plant[]`, defaulting to `[]`)

**`useCreatePlant()`**
- Calls `createPlant(payload)` from `src/api/plants.ts`
- On success: invalidates `['plants']` query so the home screen refetches automatically
- On error: calls `Alert.alert('Error', 'Failed to save your plant. Please try again.')` in the `onError` mutation callback
- Returns the mutation object (caller uses `mutateAsync`, `isPending`)

### 3. `HomeScreen` — Use `usePlants()`

Replace manual `plants/loading/refreshing/error` state + `fetchPlants` callback with `usePlants()`. Map:
- `isLoading` → initial load spinner
- `isError` → error state with retry button (`refetch`)
- `plants` → plant list passed to `FlatList`
- `isRefetching` → `RefreshControl`'s `refreshing` prop (not `isFetching`, which is true during initial load too)
- `refetch` → `RefreshControl`'s `onRefresh` prop

### 4. `AddPlantStep3` — Use `useCreatePlant()`

Replace manual `submitting` state with `useCreatePlant()`. The `handleSubmit` function structure stays the same — the photo upload (`uploadPhoto`) remains in `handleSubmit` before the mutation call, since it is not part of the plant creation API payload. Only the `createPlant` call and its error alert are moved into the mutation:

```
handleSubmit:
  1. setSubmitting / isPending guard (now from mutation.isPending)
  2. Get session (unchanged)
  3. uploadPhoto (unchanged, stays inline)
  4. mutateAsync({ name, photoUrl, location, wateringDays, remindersEnabled })
     - on success → reset store, router.replace to success screen
     - on error → Alert shown via onError in useCreatePlant hook
```

Use `isPending` from the mutation for the button disabled/label state.

## What Doesn't Change

- `src/api/plants.ts` — untouched, hooks delegate to existing functions
- `src/app/_layout.tsx` — already has `QueryClientProvider`, no changes needed
- All other screens — no React Query usage needed yet

## Success Criteria

- `curl http://localhost:8081/api/plants` returns JSON (401 with `{"error":"Unauthorized"}`), not HTML
- Home screen loads plants without manual state management
- Adding a plant navigates to success screen and home screen list refreshes on next visit
- Pull-to-refresh works and only shows the refresh spinner (not the full-page loading spinner) on refetch
