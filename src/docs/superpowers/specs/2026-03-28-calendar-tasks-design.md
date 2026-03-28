# Calendar & Task Management — Design Spec

**Date:** 2026-03-28
**Status:** Approved

## Context

The calendar screen exists but tasks are fully auto-generated client-side from plant care intervals (wateringDays, fertilizeDays, repotDays). There is no way to create one-off tasks, and the calendar UX has friction points: no swipe navigation, dot overflow isn't handled, and task completion has no visual feedback. This spec covers a focused upgrade to get the core calendar experience right before layering on gamification (streaks, mood, leafling — deferred to a later sprint).

---

## Scope

- Calendar UI improvements (swipe navigation, dot overflow, selection animation)
- One-off custom tasks (new DB table, API routes, React Query hooks)
- FAB + bottom sheet for adding custom tasks
- Task card `···` menu (reschedule, edit plant schedule)
- Completion animation (slide-out + checkmark spring)

Out of scope: streaks, plant mood/health pulse, leafling mascot, weekly summary stats.

---

## 1. Data Model

New Supabase table: `custom_tasks`

```sql
CREATE TABLE custom_tasks (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  plant_id      TEXT REFERENCES plants(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  type          "CareType" NOT NULL,  -- existing Postgres enum: WATER | FERTILIZE | REPOT
  due_date      DATE NOT NULL,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

Row-level security: users can only read/write their own rows (`user_id = auth.uid()`).

Auto-generated tasks remain client-side, derived from plant intervals — no change to that system. On the calendar and task list, auto-generated tasks and custom tasks are merged into the same `Task[]` type before rendering. Custom tasks get a `source: 'custom'` field added to the Task type so the reschedule action knows whether to update `lastXAt` (auto) or `due_date` (custom).

---

## 2. Task Type Extension

`src/utils/tasks.ts` — extend the `Task` type:

```ts
export type Task = {
  id: string;
  plantId: string | null;      // nullable — custom tasks can be plant-less
  plantName: string;           // falls back to task title when no plant linked
  plantPhotoUrl: string | null;
  type: CareType;
  dueDate: string;
  isOverdue: boolean;
  source: 'auto' | 'custom';   // new field
  customTaskId?: string;        // set when source === 'custom'
  title?: string;               // custom task label (shown instead of care type label)
};
```

A new `mergeTaskLists(autoTasks, customTasks)` utility combines both arrays, sorts by dueDate, and returns a unified `Task[]`.

---

## 3. API Routes

**`POST /api/custom-tasks`**
Body: `{ plantId?, title, type, dueDate }`
Returns: created custom task row.

**`PATCH /api/custom-tasks/[id]`**
Body: `{ dueDate?, completedAt? }`
Handles reschedule and completion.

**`DELETE /api/custom-tasks/[id]`**
Deletes the custom task.

---

## 4. React Query Hooks

`src/hooks/custom-tasks.ts`:

- `useCustomTasks(rangeStart, rangeEnd)` — fetches custom tasks within date range, used alongside `usePlants()` on both calendar and home screens
- `useCreateCustomTask()` — mutation, invalidates custom-tasks query on success
- `useUpdateCustomTask()` — mutation for reschedule + complete
- `useDeleteCustomTask()` — mutation

---

## 5. Calendar UI Changes

**File:** `src/components/screens/calendar/MonthCalendar.tsx`

- **Swipe navigation:** Wrap the grid in a `PanGestureHandler` (Reanimated v4). Horizontal swipe > 50px threshold triggers prev/next month with a slide transition. Keep the existing prev/next chevron buttons as fallback.
- **Dot overflow:** Show max 3 dots per day. If a day has tasks of more than 3 types (unlikely with 3 care types, but custom tasks can push it), show 2 dots + a small `+N` label in the same row.
- **Selection animation:** Selected date circle animates in with a spring (scale 0.6 → 1.0). Today uses an outline ring; selected uses a filled circle.

---

## 6. FAB + Add Task Bottom Sheet

**FAB:** Fixed-position `+` button in the bottom-right of the calendar screen (above the task list). Same green as `COLORS.primaryDark`. Presses with a scale spring animation.

**Bottom sheet** (`src/components/sheets/add-task-sheet.tsx`):

Follows the same pattern as `ExampleSheet` — accepts `sheetRef: React.RefObject<TrueSheet | null>` and `handleDismiss: () => void`. Uses `BaseSheet` with `detents={['auto']}` (auto-sizes to form content) and `BaseSheetHeader` with title `"Add Task"`.

```tsx
<BaseSheet ref={sheetRef} detents={['auto']}>
    <BaseSheetHeader title="Add Task" handleClose={handleDismiss} />
    {/* form content */}
</BaseSheet>
```

Form fields (inside a `ScrollView` with horizontal padding matching `APP_HORIZONTAL_PADDING`):
- **Title** — `TextInputValidated`, required
- **Care type** — pill selector row: Water / Fertilise / Repot (controls dot colour)
- **Plant** — optional dropdown built from `usePlants()`; shows plant name, defaults to "No plant"
- **Date** — pre-filled from `selectedDate`, read-only label (user selected the date before tapping FAB)
- **Add Task** — `MainButton`, calls `useCreateCustomTask()`, dismisses sheet via `sheetRef.current?.dismiss()` on success

Validation: title and care type required; date always pre-filled so never empty.

---

## 7. Task Card — `···` Menu

**File:** `src/components/screens/home/TaskCard.tsx`

Small `···` icon in the top-right of each card (hidden until tapped, or always visible — TBD during implementation based on visual weight). Pressing it shows an `ActionSheet` with:

| Option | Auto task | Custom task |
|---|---|---|
| Complete | ✅ | ✅ |
| Reschedule | Updates `lastXAt` on plant (shifts series) | Updates `due_date` on custom task |
| Edit plant schedule | Deep-links to plant edit screen | Deep-links to plant edit screen (if plant linked) |
| Delete | — | Deletes custom task |

---

## 8. Completion Animation

**File:** `src/components/screens/home/TaskCard.tsx`

On complete button press:
1. Complete circle fills green + checkmark via a spring scale animation (Reanimated v4 `withSpring`)
2. Card simultaneously slides right (`translateX` 0 → screen width) and fades out (`opacity` 1 → 0) over ~300ms
3. Haptic feedback fires at the moment the checkmark appears (already wired, just sync timing)
4. If the completed task was the last one for the selected date, a "All done 🌱" empty-state message fades in

---

## 9. Screen Integration

Both **calendar** (`/calendar/index.tsx`) and **home** (`/home/index.tsx`) screens:

1. Call `useCustomTasks(rangeStart, rangeEnd)` alongside existing `usePlants()`
2. Pass both to a `mergeTaskLists()` call before passing to `TaskList`
3. FAB renders only on the calendar screen
4. Home screen uses the same merged tasks for the week strip and task list

---

## Verification

1. **Prisma migration:** Run `npx prisma migrate dev` — `custom_tasks` table created with RLS
2. **Add a custom task:** Open calendar, select a date, tap FAB, fill form → task appears in list and dot appears on calendar
3. **Reschedule:** Tap `···` on a task → Reschedule → pick new date → task moves on calendar
4. **Complete animation:** Mark a task done → checkmark spring + slide-out plays, haptic fires
5. **Swipe navigation:** Swipe left on calendar → advances to next month with slide transition
6. **Merging:** Add a custom task on the same day as an auto-generated task — both appear in list, both show dots
7. **Type check:** `npx tsc --noEmit` passes with no errors
