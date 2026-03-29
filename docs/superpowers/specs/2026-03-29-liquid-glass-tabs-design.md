# Design: Liquid Glass Tab Bar with Native Tabs

**Date:** 2026-03-29

---

## Context

The current tab bar uses React Navigation's JS-rendered `<Tabs>` component with 4 flat tabs. Adding a new plant is scattered across home and garden screens. The goal is to:
1. Replace the tab bar with a true native iOS liquid glass tab bar (`NativeTabs`)
2. Consolidate plant creation into a single, visually distinct action tab at the trailing edge
3. Remove all other "Add plant" entry points from the app

---

## Layout

5 tabs, fixed order:

```
[ Home ]  [ Calendar ]  [ My Garden ]  [ Profile ]  [ 🌿 ]
```

- **Home, Calendar, My Garden, Profile** — standard icon + label nav tabs
- **Plant (🌿)** — trailing action tab: leaf icon only, no label, brand green color
  - Tapping intercepts default tab navigation via `listeners.tabPress`
  - Navigates to `/(protected)/add-plant` (step 1) and triggers haptic
  - Does not maintain any tab state — purely an action

---

## Implementation: NativeTabs

Replace `<Tabs>` from `expo-router` with `<NativeTabs>` from `expo-router/unstable-native-tabs`.

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

<NativeTabs
  blurEffect="systemChromeMaterial"
  tintColor={COLORS.primary}
  iconColor={{ default: COLORS.gray, selected: COLORS.primary }}
  labelStyle={{ fontFamily: FONTS.InterRegular, fontSize: 12 }}
>
  <NativeTabs.Trigger name="(home)">
    <NativeTabs.Trigger.Icon src={require('@/src/assets/icons/tab-icons/home-icon.png')} />
    <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
  </NativeTabs.Trigger>

  <NativeTabs.Trigger name="(calendar)">
    <NativeTabs.Trigger.Icon src={require('...')} />
    <NativeTabs.Trigger.Label>Calendar</NativeTabs.Trigger.Label>
  </NativeTabs.Trigger>

  <NativeTabs.Trigger name="(my-garden)">
    <NativeTabs.Trigger.Icon src={require('...')} />
    <NativeTabs.Trigger.Label>My Garden</NativeTabs.Trigger.Label>
  </NativeTabs.Trigger>

  <NativeTabs.Trigger name="(profile)">
    <NativeTabs.Trigger.Icon src={require('...')} />
    <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
  </NativeTabs.Trigger>

  {/* Action tab — intercepts press, never actually navigates */}
  {/* role="search" creates visual separation on iOS 26; icon overrides the system search icon */}
  <NativeTabs.Trigger
    name="(add-plant-action)"
    role="search"
    listeners={{
      tabPress: (e) => {
        e.preventDefault();
        hapticMedium();
        router.push('/(protected)/add-plant');
      },
    }}
  >
    <NativeTabs.Trigger.Icon sf={{ default: 'leaf.fill', selected: 'leaf.fill' }} />
    {/* No Label */}
  </NativeTabs.Trigger>
</NativeTabs>
```

### Why `blurEffect="systemChromeMaterial"`
Maps to UIBlurEffect `.systemChromeMaterial` — the standard iOS tab bar blur. On iOS 26 with liquid glass enabled, this renders as true liquid glass automatically. No additional glass components needed for the tab bar itself.

### Icon strategy
- **Existing tabs**: Current custom SVGs likely can't be used directly as `src` (they're React components, not image assets). **Two options:**
  - A: Export PNG/WebP versions of the existing SVG icons and use `src`
  - B: Replace all tab icons with SF Symbols (`sf` prop) — cleaner, fully native, adapts to dark mode automatically
  - **Recommended: B (SF Symbols)** — keeps the tab bar fully native

  | Tab | SF Symbol |
  |-----|-----------|
  | Home | `house.fill` / `house` |
  | Calendar | `calendar` |
  | My Garden | `leaf` / `tree` |
  | Profile | `person.circle.fill` / `person` |
  | Add Plant (action) | `leaf.fill` with green `iconColor` |

- **Action tab icon**: `leaf.fill` with `iconColor={{ default: COLORS.primary, selected: COLORS.primary }}` — always green, no label, creating clear visual separation from the nav tabs

### Action tab route
A minimal screen file is needed so expo-router doesn't throw a missing route error:
- `src/app/(protected)/(tabs)/(add-plant-action)/index.tsx` — renders `null` (never actually shown)
- The `tabPress` listener fires before navigation occurs, so the screen never renders

---

## Entry point cleanup

Remove "Add plant" (create new, no `plantId`) buttons from:
- `src/app/(protected)/(tabs)/(home)/index.tsx` — line ~160
- `src/app/(protected)/(tabs)/(my-garden)/index.tsx` — line ~80

**Keep** (these are edit flows, not create):
- `(my-garden)/[id].tsx` — `?plantId=` edit nav
- `(home)/index.tsx` — task action with `?plantId=`
- `(calendar)/index.tsx` — task action with `?plantId=`

---

## Files to create
- `src/app/(protected)/(tabs)/(add-plant-action)/index.tsx` — empty screen (returns null)

## Files to modify
- `src/app/(protected)/(tabs)/_layout.tsx` — replace `<Tabs>` with `<NativeTabs>`, add action tab
- `src/app/(protected)/(tabs)/(home)/index.tsx` — remove add-plant button
- `src/app/(protected)/(tabs)/(my-garden)/index.tsx` — remove add-plant button

## Icons to audit
- `src/assets/icons/tab-icons/` — existing SVG icon components; replace with SF Symbols in NativeTabs (SVGs are unused after migration)

---

## Compatibility concerns

### 1. `NativeTabs` is unstable API
The import is `expo-router/unstable-native-tabs` — API may change in minor SDK updates. Acceptable for this project at MVP stage.

### 2. Icon format — SVG components won't work as `src`
Current tab icons are React components (not image assets). Must use SF Symbols (`sf` prop) or export as PNG. SF Symbols recommended.

### 3. `tabPress` listener intercept on action tab
`e.preventDefault()` stops the default tab navigation. The router.push fires immediately. On iOS, this is seamless. Verify the listener fires before any tab state update.

### 4. Empty screen for action tab route
expo-router requires a file at the route path. The `(add-plant-action)/index.tsx` file returning `null` satisfies this without rendering anything.

### 5. `role="search"` + custom icon — confirmed approach
`role="search"` creates the visual separator on iOS 26. The icon is overridden via `sf={{ default: 'leaf.fill', selected: 'leaf.fill' }}` on `NativeTabs.Trigger.Icon`, which takes priority over the system role icon at the native layer. Both apply independently.

### 6. Liquid glass on iOS < 26
`blurEffect="systemChromeMaterial"` gives standard frosted glass on iOS 16–25 and true liquid glass on iOS 26+. Graceful degradation is built-in.

### 6. Android
`NativeTabs` renders a `BottomNavigationView` on Android. `blurEffect` is iOS-only and ignored on Android. Add `backgroundColor` fallback for Android.

---

## Verification

1. Run on iOS 26 simulator — tab bar should render as floating liquid glass
2. Run on iOS 16 simulator — should render as frosted glass (graceful degradation)
3. Tap the leaf tab — should navigate to add-plant step 1 with haptic, no tab selection change
4. Verify no "Add plant" buttons remain on home or garden screens
5. Verify edit-plant flows still work (`?plantId=` navigations)
6. All 4 nav tabs (Home, Calendar, My Garden, Profile) navigate correctly and maintain active state
7. `npx tsc --noEmit` — zero type errors
