# Calendar & Task Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the calendar with swipe navigation, animated task completion, and one-off custom tasks backed by a new Supabase table.

**Architecture:** Auto-generated tasks (derived client-side from plant intervals) and custom tasks (persisted in Supabase) are merged into a unified `Task[]` before rendering — neither the calendar nor the task list knows the difference. A FAB on the calendar screen opens an `AddTaskSheet` (built with existing `BaseSheet`/`BaseSheetHeader` components) pre-filled with the selected date.

**Tech Stack:** Expo Router API routes, Prisma + Supabase Postgres, React Query (`@tanstack/react-query`), Reanimated v4, `react-native-gesture-handler`, `@lodev09/react-native-true-sheet`, `sonner-native` for toasts, `lucide-react-native` for icons.

---

## File Map

**New files:**
- `src/api/custom-tasks.ts` — API client (types + fetch functions)
- `src/app/api/custom-tasks+api.ts` — GET + POST route
- `src/app/api/custom-tasks/[id]+api.ts` — PATCH + DELETE route
- `src/hooks/custom-tasks.ts` — React Query hooks
- `src/components/sheets/add-task-sheet.tsx` — Add task bottom sheet

**Modified files:**
- `prisma/schema.prisma` — add `CustomTask` model
- `src/utils/tasks.ts` — extend `Task` type, add `mergeTaskLists()`
- `src/components/screens/calendar/MonthCalendar.tsx` — swipe nav, dot overflow, selection spring
- `src/components/screens/home/TaskCard.tsx` — completion animation, `···` menu
- `src/app/(protected)/(tabs)/(calendar)/index.tsx` — custom tasks + FAB
- `src/app/(protected)/(tabs)/(home)/index.tsx` — custom tasks merge

---

## Task 1: Extend Task type + add mergeTaskLists

**Files:**
- Modify: `src/utils/tasks.ts`

- [ ] **Step 1: Update the Task type**

Replace the existing `Task` type with:

```ts
export type Task = {
    /** Deterministic ID: `{plantId}-{type}-{YYYY-MM-DD}` or `{plantId}-{type}-overdue` for auto tasks; DB id for custom tasks */
    id: string;
    plantId: string | null;
    plantName: string; // falls back to task title when no plant linked
    plantPhotoUrl: string | null;
    type: CareType;
    dueDate: string;
    isOverdue: boolean;
    source: 'auto' | 'custom';
    customTaskId?: string; // set when source === 'custom'
    title?: string;        // custom task label, shown in place of care type label when set
};
```

- [ ] **Step 2: Add source: 'auto' to generateTasks()**

In `generateTasks()`, add `source: 'auto' as const` to every pushed task object. There are two `tasks.push({...})` calls — update both:

```ts
// overdue push
tasks.push({
    id: `${plant.id}-${type}-overdue`,
    plantId: plant.id,
    plantName: plant.name,
    plantPhotoUrl: plant.photoUrl ?? null,
    type,
    dueDate: rangeStart.toISOString(),
    isOverdue: true,
    source: 'auto',
});

// recurring push
tasks.push({
    id: `${plant.id}-${type}-${nextDue.format('YYYY-MM-DD')}`,
    plantId: plant.id,
    plantName: plant.name,
    plantPhotoUrl: plant.photoUrl ?? null,
    type,
    dueDate: nextDue.toISOString(),
    isOverdue: false,
    source: 'auto',
});
```

- [ ] **Step 3: Add mergeTaskLists() at the bottom of the file**

```ts
/**
 * Merge auto-generated and custom tasks into a single array sorted by dueDate.
 * Overdue tasks are sorted to the front regardless of source.
 */
export function mergeTaskLists(autoTasks: Task[], customTasks: Task[]): Task[] {
    return [...autoTasks, ...customTasks].sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf();
    });
}
```

- [ ] **Step 4: Type-check**

```bash
cd /Users/dylanlindsay/Documents/Projects/sprout-expo && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/utils/tasks.ts
git commit -m "feat: extend Task type with source field and add mergeTaskLists"
```

---

## Task 2: Prisma schema — CustomTask model + migration

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add CustomTask model to schema**

Append to `prisma/schema.prisma` after the `PlantCareLog` model:

```prisma
model CustomTask {
  id          String    @id @default(cuid())
  userId      String    @map("user_id")
  plantId     String?   @map("plant_id")
  title       String
  type        CareType
  dueDate     DateTime  @map("due_date") @db.Date
  completedAt DateTime? @map("completed_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  plant       Plant?    @relation(fields: [plantId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([dueDate])
  @@map("custom_tasks")
}
```

Also add `customTasks CustomTask[]` to the `Plant` model relation list (after `careLogs PlantCareLog[]`):

```prisma
  careLogs         PlantCareLog[]
  customTasks      CustomTask[]
```

- [ ] **Step 2: Run migration**

```bash
npx prisma migrate dev --name add_custom_tasks
```

Expected output: `Your database is now in sync with your schema.`

- [ ] **Step 3: Verify Prisma client generated**

```bash
npx prisma generate
```

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add CustomTask model and migration"
```

---

## Task 3: Custom tasks API client

**Files:**
- Create: `src/api/custom-tasks.ts`

- [ ] **Step 1: Create the API client file**

```ts
import supabase from '@/src/lib/supabase';
import type { CareType } from './care-logs';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
if (!API_BASE) throw new Error('EXPO_PUBLIC_API_URL is not set');

async function getAuthHeaders(): Promise<Record<string, string>> {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
    };
}

export type CustomTask = {
    id: string;
    userId: string;
    plantId: string | null;
    title: string;
    type: CareType;
    dueDate: string;
    completedAt: string | null;
    createdAt: string;
};

export type CreateCustomTaskPayload = {
    plantId?: string;
    title: string;
    type: CareType;
    dueDate: string; // ISO date string YYYY-MM-DD
};

export type UpdateCustomTaskPayload = {
    dueDate?: string;
    completedAt?: string | null;
};

export async function listCustomTasks(rangeStart: string, rangeEnd: string): Promise<CustomTask[]> {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams({ rangeStart, rangeEnd });
    const res = await fetch(`${API_BASE}/custom-tasks?${params}`, { headers });
    if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to fetch custom tasks';
        try {
            const err = JSON.parse(text);
            message = err.error ?? message;
        } catch {}
        throw new Error(message);
    }
    const data = await res.json();
    return data.customTasks;
}

export async function createCustomTask(payload: CreateCustomTaskPayload): Promise<CustomTask> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/custom-tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to create task';
        try {
            const err = JSON.parse(text);
            message = err.error ?? message;
        } catch {}
        throw new Error(message);
    }
    const data = await res.json();
    return data.customTask;
}

export async function updateCustomTask(
    id: string,
    payload: UpdateCustomTaskPayload,
): Promise<CustomTask> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/custom-tasks/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to update task';
        try {
            const err = JSON.parse(text);
            message = err.error ?? message;
        } catch {}
        throw new Error(message);
    }
    const data = await res.json();
    return data.customTask;
}

export async function deleteCustomTask(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/custom-tasks/${id}`, {
        method: 'DELETE',
        headers,
    });
    if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to delete task';
        try {
            const err = JSON.parse(text);
            message = err.error ?? message;
        } catch {}
        throw new Error(message);
    }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/api/custom-tasks.ts
git commit -m "feat: add custom-tasks API client"
```

---

## Task 4: Custom tasks API routes

**Files:**
- Create: `src/app/api/custom-tasks+api.ts`
- Create: `src/app/api/custom-tasks/[id]+api.ts`

- [ ] **Step 1: Create the collection route (GET + POST)**

Create `src/app/api/custom-tasks+api.ts`:

```ts
import { getUserId, unauthorized } from '@/src/app/api/_utils';
import prisma from '@/src/lib/prisma';
import { CareType } from '@prisma/client';

export async function GET(request: Request) {
    try {
        const userId = await getUserId(request);
        if (!userId) return unauthorized();

        const url = new URL(request.url);
        const rangeStart = url.searchParams.get('rangeStart');
        const rangeEnd = url.searchParams.get('rangeEnd');

        const where: Record<string, unknown> = { userId, completedAt: null };

        if (rangeStart && rangeEnd) {
            where.dueDate = {
                gte: new Date(rangeStart),
                lte: new Date(rangeEnd),
            };
        }

        const customTasks = await prisma.customTask.findMany({
            where,
            orderBy: { dueDate: 'asc' },
        });

        return Response.json({ customTasks });
    } catch (error) {
        console.error('[API Error]', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const userId = await getUserId(request);
        if (!userId) return unauthorized();

        const body = await request.json();
        const { plantId, title, type, dueDate } = body;

        if (!title || typeof title !== 'string' || !title.trim()) {
            return Response.json({ error: 'Title is required' }, { status: 400 });
        }

        const validTypes: CareType[] = ['WATER', 'FERTILIZE', 'REPOT'];
        if (!validTypes.includes(type)) {
            return Response.json({ error: 'Invalid care type' }, { status: 400 });
        }

        if (!dueDate) {
            return Response.json({ error: 'dueDate is required' }, { status: 400 });
        }

        const customTask = await prisma.customTask.create({
            data: {
                userId,
                plantId: plantId ?? null,
                title: title.trim(),
                type,
                dueDate: new Date(dueDate),
            },
        });

        return Response.json({ customTask }, { status: 201 });
    } catch (error) {
        console.error('[API Error]', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
```

- [ ] **Step 2: Create the item route (PATCH + DELETE)**

Create `src/app/api/custom-tasks/[id]+api.ts`:

```ts
import { getUserId, notFound, unauthorized } from '@/src/app/api/_utils';
import prisma from '@/src/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = await getUserId(request);
        if (!userId) return unauthorized();

        const task = await prisma.customTask.findFirst({
            where: { id: params.id, userId },
        });
        if (!task) return notFound();

        const body = await request.json();
        const { dueDate, completedAt } = body;

        const data: Record<string, unknown> = {};
        if (dueDate !== undefined) data.dueDate = new Date(dueDate);
        if (completedAt !== undefined) {
            data.completedAt = completedAt ? new Date(completedAt) : null;
        }

        const customTask = await prisma.customTask.update({
            where: { id: params.id },
            data,
        });

        return Response.json({ customTask });
    } catch (error) {
        console.error('[API Error]', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = await getUserId(request);
        if (!userId) return unauthorized();

        const task = await prisma.customTask.findFirst({
            where: { id: params.id, userId },
        });
        if (!task) return notFound();

        await prisma.customTask.delete({ where: { id: params.id } });

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('[API Error]', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
```

- [ ] **Step 3: Extend plant PATCH route to accept lastXAt fields**

In `src/app/api/plants/[id]+api.ts`, update the destructuring and `data` object in the PATCH handler to include the three timestamp fields:

```ts
const {
    name,
    photoUrl,
    location,
    wateringDays,
    waterAmountMl,
    fertilizeDays,
    repotDays,
    remindersEnabled,
    lastWateredAt,      // ← add
    lastFertilizedAt,   // ← add
    lastRepottedAt,     // ← add
} = body;

const plant = await prisma.plant.update({
    where: { id: params.id },
    data: {
        ...(name !== undefined && { name }),
        ...(photoUrl !== undefined && { photoUrl }),
        ...(location !== undefined && { location }),
        ...(wateringDays !== undefined && { wateringDays }),
        ...(waterAmountMl !== undefined && { waterAmountMl }),
        ...(fertilizeDays !== undefined && { fertilizeDays }),
        ...(repotDays !== undefined && { repotDays }),
        ...(remindersEnabled !== undefined && { remindersEnabled }),
        ...(lastWateredAt !== undefined && { lastWateredAt: lastWateredAt ? new Date(lastWateredAt) : null }),     // ← add
        ...(lastFertilizedAt !== undefined && { lastFertilizedAt: lastFertilizedAt ? new Date(lastFertilizedAt) : null }), // ← add
        ...(lastRepottedAt !== undefined && { lastRepottedAt: lastRepottedAt ? new Date(lastRepottedAt) : null }),   // ← add
    },
});
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/custom-tasks+api.ts src/app/api/custom-tasks/[id]+api.ts src/app/api/plants/[id]+api.ts
git commit -m "feat: add custom-tasks API routes and extend plant PATCH to accept lastXAt fields"
```

---

## Task 5: Custom tasks React Query hooks

**Files:**
- Create: `src/hooks/custom-tasks.ts`

- [ ] **Step 1: Create the hooks file**

```ts
import {
    createCustomTask,
    CreateCustomTaskPayload,
    CustomTask,
    deleteCustomTask,
    listCustomTasks,
    updateCustomTask,
    UpdateCustomTaskPayload,
} from '@/src/api/custom-tasks';
import { Task } from '@/src/utils/tasks';
import { CareType } from '@/src/api/care-logs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dayjs } from 'dayjs';
import { Alert } from 'react-native';
import { toast } from 'sonner-native';

export function useCustomTasks(rangeStart: Dayjs, rangeEnd: Dayjs) {
    const queryClient = useQueryClient();
    const { data, isLoading, isError } = useQuery({
        queryKey: ['custom-tasks', rangeStart.format('YYYY-MM-DD'), rangeEnd.format('YYYY-MM-DD')],
        queryFn: () =>
            listCustomTasks(rangeStart.format('YYYY-MM-DD'), rangeEnd.format('YYYY-MM-DD')),
    });

    const plants: { id: string; name: string }[] =
        queryClient.getQueryData(['plants']) ?? [];

    const customTasks = (data ?? []).map((ct): Task => {
        const linkedPlant = ct.plantId ? plants.find((p) => p.id === ct.plantId) : null;
        return {
            id: `custom-${ct.id}`,
            plantId: ct.plantId,
            plantName: linkedPlant?.name ?? ct.title, // plant name if linked, else task title
            plantPhotoUrl: null,
            type: ct.type as CareType,
            dueDate: ct.dueDate,
            isOverdue: false,
            source: 'custom',
            customTaskId: ct.id,
            title: ct.title,
        };
    });

    return { customTasks, isLoading, isError };
}

export function useCreateCustomTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateCustomTaskPayload) => createCustomTask(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['custom-tasks'] });
            toast.success('Task added!');
        },
        onError: () => {
            Alert.alert('Error', 'Failed to add task. Please try again.');
        },
    });
}

export function useUpdateCustomTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomTaskPayload }) =>
            updateCustomTask(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['custom-tasks'] });
        },
        onError: () => {
            Alert.alert('Error', 'Failed to update task. Please try again.');
        },
    });
}

export function useDeleteCustomTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteCustomTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['custom-tasks'] });
            toast.success('Task deleted.');
        },
        onError: () => {
            Alert.alert('Error', 'Failed to delete task. Please try again.');
        },
    });
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/custom-tasks.ts
git commit -m "feat: add custom-tasks React Query hooks"
```

---

## Task 6: AddTaskSheet component

**Files:**
- Create: `src/components/sheets/add-task-sheet.tsx`

- [ ] **Step 1: Create the component**

```tsx
import MainButton from '@/src/components/core/MainButton';
import AppText from '@/src/components/core/AppText';
import BaseSheet from '@/src/components/sheets/base-sheet';
import BaseSheetHeader from '@/src/components/sheets/base-sheet-header';
import { COLORS } from '@/src/constants/theme';
import { useCreateCustomTask } from '@/src/hooks/custom-tasks';
import { usePlants } from '@/src/hooks/plants';
import { CareType } from '@/src/api/care-logs';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import dayjs, { Dayjs } from 'dayjs';
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

type Props = {
    sheetRef: React.RefObject<TrueSheet | null>;
    selectedDate: Dayjs;
    handleDismiss: () => void;
};

const CARE_TYPES: { type: CareType; label: string; color: string }[] = [
    { type: 'WATER', label: 'Water', color: '#4A9EE8' },
    { type: 'FERTILIZE', label: 'Fertilise', color: '#78B652' },
    { type: 'REPOT', label: 'Repot', color: '#A0714F' },
];

export default function AddTaskSheet({ sheetRef, selectedDate, handleDismiss }: Props) {
    const [title, setTitle] = useState('');
    const [selectedType, setSelectedType] = useState<CareType | null>(null);
    const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
    const { plants } = usePlants();
    const createCustomTask = useCreateCustomTask();

    const reset = () => {
        setTitle('');
        setSelectedType(null);
        setSelectedPlantId(null);
    };

    const handleAdd = async () => {
        if (!title.trim() || !selectedType) return;
        createCustomTask.mutate(
            {
                title: title.trim(),
                type: selectedType,
                dueDate: selectedDate.format('YYYY-MM-DD'),
                ...(selectedPlantId ? { plantId: selectedPlantId } : {}),
            },
            {
                onSuccess: () => {
                    reset();
                    sheetRef.current?.dismiss();
                },
            },
        );
    };

    const isValid = title.trim().length > 0 && selectedType !== null;

    return (
        <BaseSheet ref={sheetRef} detents={['auto']} onDismiss={reset}>
            <BaseSheetHeader
                title={`Add Task · ${selectedDate.format('MMM D')}`}
                handleClose={handleDismiss}
            />
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
            >
                {/* Title */}
                <AppText size="xs" color="gray" style={{ marginBottom: 6 }}>
                    Task title
                </AppText>
                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="e.g. Check for pests"
                    placeholderTextColor={COLORS.textSecondary}
                    style={{
                        borderWidth: 1,
                        borderColor: COLORS.border,
                        borderRadius: 10,
                        padding: 12,
                        fontSize: 15,
                        marginBottom: 20,
                        color: COLORS.text,
                    }}
                    autoCapitalize="sentences"
                    returnKeyType="done"
                />

                {/* Care type */}
                <AppText size="xs" color="gray" style={{ marginBottom: 8 }}>
                    Care type
                </AppText>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                    {CARE_TYPES.map(({ type, label, color }) => {
                        const isActive = selectedType === type;
                        return (
                            <Pressable
                                key={type}
                                onPress={() => setSelectedType(type)}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    borderRadius: 10,
                                    alignItems: 'center',
                                    backgroundColor: isActive ? `${color}20` : COLORS.backgroundSecondary,
                                    borderWidth: 1.5,
                                    borderColor: isActive ? color : 'transparent',
                                }}
                            >
                                <AppText
                                    size="xs"
                                    font="semiBold"
                                    style={{ color: isActive ? color : COLORS.textSecondary }}
                                >
                                    {label}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Plant (optional) */}
                {plants.length > 0 && (
                    <>
                        <AppText size="xs" color="gray" style={{ marginBottom: 8 }}>
                            Plant (optional)
                        </AppText>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 8, marginBottom: 24 }}
                        >
                            <Pressable
                                onPress={() => setSelectedPlantId(null)}
                                style={{
                                    paddingHorizontal: 14,
                                    paddingVertical: 8,
                                    borderRadius: 20,
                                    backgroundColor:
                                        selectedPlantId === null
                                            ? COLORS.primaryDark
                                            : COLORS.backgroundSecondary,
                                }}
                            >
                                <AppText
                                    size="xs"
                                    font="semiBold"
                                    style={{
                                        color: selectedPlantId === null ? '#fff' : COLORS.textSecondary,
                                    }}
                                >
                                    No plant
                                </AppText>
                            </Pressable>
                            {plants.map((plant) => (
                                <Pressable
                                    key={plant.id}
                                    onPress={() => setSelectedPlantId(plant.id)}
                                    style={{
                                        paddingHorizontal: 14,
                                        paddingVertical: 8,
                                        borderRadius: 20,
                                        backgroundColor:
                                            selectedPlantId === plant.id
                                                ? COLORS.primaryDark
                                                : COLORS.backgroundSecondary,
                                    }}
                                >
                                    <AppText
                                        size="xs"
                                        font="semiBold"
                                        style={{
                                            color:
                                                selectedPlantId === plant.id
                                                    ? '#fff'
                                                    : COLORS.textSecondary,
                                        }}
                                    >
                                        {plant.name}
                                    </AppText>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </>
                )}

                <MainButton
                    text="Add Task"
                    onPress={handleAdd}
                    isLoading={createCustomTask.isPending}
                    isDisabled={!isValid}
                />
            </ScrollView>
        </BaseSheet>
    );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sheets/add-task-sheet.tsx
git commit -m "feat: add AddTaskSheet component using BaseSheet"
```

---

## Task 7: Calendar screen — integrate custom tasks + FAB

**Files:**
- Modify: `src/app/(protected)/(tabs)/(calendar)/index.tsx`

- [ ] **Step 1: Replace the calendar screen**

```tsx
import AppText from '@/src/components/core/AppText';
import MonthCalendar from '@/src/components/screens/calendar/MonthCalendar';
import TaskList from '@/src/components/screens/home/TaskList';
import AddTaskSheet from '@/src/components/sheets/add-task-sheet';
import { COLORS } from '@/src/constants/theme';
import { useLogCareAction } from '@/src/hooks/care-logs';
import { useCustomTasks, useUpdateCustomTask } from '@/src/hooks/custom-tasks';
import { usePlants } from '@/src/hooks/plants';
import { generateTasks, getTasksForDate, mergeTaskLists, Task } from '@/src/utils/tasks';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import dayjs, { Dayjs } from 'dayjs';
import { Plus } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

export default function CalendarScreen() {
    const { plants, isLoading: plantsLoading, isError: plantsError } = usePlants();
    const [month, setMonth] = useState<Dayjs>(dayjs().startOf('month'));
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs().startOf('day'));
    const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
    const logCareAction = useLogCareAction();
    const updateCustomTask = useUpdateCustomTask();
    const addTaskSheetRef = useRef<TrueSheet>(null);

    const rangeStart = useMemo(() => dayjs().startOf('day'), []);
    const rangeEnd = useMemo(() => month.endOf('month'), [month]);

    const { customTasks, isLoading: customLoading } = useCustomTasks(rangeStart, rangeEnd);

    const autoTasks = useMemo(
        () => generateTasks(plants, rangeStart, rangeEnd),
        [plants, rangeStart, rangeEnd],
    );

    const allTasks = useMemo(
        () => mergeTaskLists(autoTasks, customTasks),
        [autoTasks, customTasks],
    );

    const selectedDateTasks = useMemo(() => getTasksForDate(allTasks, selectedDate), [allTasks, selectedDate]);

    const isToday = selectedDate.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
    const taskSectionTitle = isToday
        ? "Today's Tasks"
        : `Tasks for ${selectedDate.format('ddd, MMM D')}`;

    const isLoading = plantsLoading || customLoading;
    const isError = plantsError;

    const handleCompleteTask = (task: Task) => {
        if (task.source === 'custom') {
            // Mark custom task done via completedAt timestamp
            if (task.customTaskId) {
                updateCustomTask.mutate({
                    id: task.customTaskId,
                    payload: { completedAt: new Date().toISOString() },
                });
            }
            return;
        }
        setCompletingTaskId(task.id);
        logCareAction.mutate(
            { plantId: task.plantId!, type: task.type },
            { onSettled: () => setCompletingTaskId(null) },
        );
    };

    return (
        <View className="flex-1" style={{ backgroundColor: COLORS.backgroundSecondary }}>
            {/* Header */}
            <View
                className="px-6 pt-14 pb-4 bg-white"
                style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border }}
            >
                <AppText size="lg" font="bold">
                    Calendar
                </AppText>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : isError ? (
                <View className="flex-1 items-center justify-center px-6">
                    <AppText size="sm" color="gray" align="center">
                        Failed to load calendar data
                    </AppText>
                </View>
            ) : (
                <>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <MonthCalendar
                            month={month}
                            tasks={allTasks}
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                            onPrevMonth={() => setMonth((m) => m.subtract(1, 'month'))}
                            onNextMonth={() => setMonth((m) => m.add(1, 'month'))}
                        />
                        <View
                            style={{
                                height: 1,
                                backgroundColor: COLORS.border,
                                marginHorizontal: 16,
                                marginVertical: 8,
                            }}
                        />
                        <View className="px-4 pb-8">
                            <TaskList
                                title={taskSectionTitle}
                                tasks={selectedDateTasks}
                                onCompleteTask={handleCompleteTask}
                                completingTaskId={completingTaskId ?? undefined}
                            />
                        </View>
                    </ScrollView>

                    {/* FAB */}
                    <Pressable
                        onPress={() => addTaskSheetRef.current?.present()}
                        style={{
                            position: 'absolute',
                            bottom: 24,
                            right: 24,
                            width: 52,
                            height: 52,
                            borderRadius: 26,
                            backgroundColor: COLORS.primaryDark,
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: COLORS.primaryDark,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.35,
                            shadowRadius: 8,
                            elevation: 6,
                        }}
                    >
                        <Plus size={24} color="#fff" />
                    </Pressable>

                    <AddTaskSheet
                        sheetRef={addTaskSheetRef}
                        selectedDate={selectedDate}
                        handleDismiss={() => addTaskSheetRef.current?.dismiss()}
                    />
                </>
            )}
        </View>
    );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Run the app and verify**

```bash
npx expo start
```

- Open calendar tab — should load as before
- Tap FAB — sheet should slide up with the correct selected date in the title
- Fill form and tap "Add Task" — task should appear in the list and a dot on the calendar

- [ ] **Step 4: Commit**

```bash
git add "src/app/(protected)/(tabs)/(calendar)/index.tsx"
git commit -m "feat: integrate custom tasks and FAB into calendar screen"
```

---

## Task 8: Home screen — integrate custom tasks

**Files:**
- Modify: `src/app/(protected)/(tabs)/(home)/index.tsx`

- [ ] **Step 1: Add useCustomTasks and merge into allTasks**

Add these imports at the top of the existing file:

```ts
import { useCustomTasks } from '@/src/hooks/custom-tasks';
import { mergeTaskLists } from '@/src/utils/tasks';
```

Inside `HomeScreen`, add after `const rangeEnd = useMemo(...)`:

```ts
const { customTasks } = useCustomTasks(dayjs().startOf('day'), rangeEnd);
```

Replace the existing `allTasks` useMemo:

```ts
const allTasks = useMemo(
    () => mergeTaskLists(generateTasks(plants, dayjs().startOf('day'), rangeEnd), customTasks),
    [plants, rangeEnd, customTasks],
);
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/(protected)/(tabs)/(home)/index.tsx"
git commit -m "feat: merge custom tasks into home screen task list"
```

---

## Task 9: MonthCalendar — dot overflow + selection spring animation

**Files:**
- Modify: `src/components/screens/calendar/MonthCalendar.tsx`

- [ ] **Step 1: Add Reanimated imports at the top**

```ts
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    useEffect,
} from 'react-native-reanimated';
```

Note: `useEffect` here is from `react-native-reanimated` (the worklet version), not React.

- [ ] **Step 2: Replace the full MonthCalendar component**

```tsx
import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import { getTasksByDateTypeMap, Task } from '@/src/utils/tasks';
import dayjs, { Dayjs } from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

type Props = {
    month: Dayjs;
    tasks: Task[];
    selectedDate: Dayjs;
    onSelectDate: (date: Dayjs) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
};

const DOT_COLORS: Record<string, string> = {
    WATER: '#4A9EE8',
    FERTILIZE: '#78B652',
    REPOT: '#A0714F',
};

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DOT_MAX = 2; // max dots shown before +N label

function DayCell({
    day,
    isSelected,
    isToday,
    careTypes,
    onPress,
}: {
    day: Dayjs;
    isSelected: boolean;
    isToday: boolean;
    careTypes: Set<string> | undefined;
    onPress: () => void;
}) {
    const scale = useSharedValue(isSelected ? 1 : 0.7);

    // Animate to 1 when selected, back to 0.7 when deselected
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isSelected ? 1 : 0.7, { damping: 14, stiffness: 180 }) }],
    }));

    const dotTypes = careTypes ? Array.from(careTypes) : [];
    const visibleDots = dotTypes.slice(0, DOT_MAX);
    const overflow = dotTypes.length - DOT_MAX;

    return (
        <Pressable
            onPress={onPress}
            style={{ flex: 1, height: 52, alignItems: 'center', justifyContent: 'center' }}
        >
            <Animated.View
                style={[
                    {
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected ? COLORS.primaryDark : 'transparent',
                        borderWidth: isToday && !isSelected ? 1.5 : 0,
                        borderColor: COLORS.primaryDark,
                    },
                    animatedStyle,
                ]}
            >
                <AppText
                    size="xs"
                    font="bold"
                    color={isSelected ? 'white' : 'black'}
                >
                    {day.format('D')}
                </AppText>
            </Animated.View>

            {/* Dots row */}
            {dotTypes.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 }}>
                    {visibleDots.map((type) => (
                        <View
                            key={type}
                            style={{
                                width: 4,
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: DOT_COLORS[type] ?? COLORS.primary,
                            }}
                        />
                    ))}
                    {overflow > 0 && (
                        <AppText size="xs" style={{ fontSize: 7, color: COLORS.textSecondary, lineHeight: 8 }}>
                            +{overflow}
                        </AppText>
                    )}
                </View>
            )}
        </Pressable>
    );
}

export default function MonthCalendar({
    month,
    tasks,
    selectedDate,
    onSelectDate,
    onPrevMonth,
    onNextMonth,
}: Props) {
    const today = dayjs().startOf('day');
    const taskMap = useMemo(() => getTasksByDateTypeMap(tasks), [tasks]);

    const grid = useMemo(() => {
        const firstDay = month.startOf('month');
        const startPad = (firstDay.day() + 6) % 7;
        const daysInMonth = month.daysInMonth();
        const cells: (Dayjs | null)[] = [];
        for (let i = 0; i < startPad; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(firstDay.date(d));
        while (cells.length % 7 !== 0) cells.push(null);
        return cells;
    }, [month]);

    return (
        <View style={{ backgroundColor: '#fff', paddingBottom: 8 }}>
            {/* Month header */}
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
                <Pressable
                    onPress={onPrevMonth}
                    style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
                >
                    <ChevronLeft size={20} color={COLORS.textSecondary} />
                </Pressable>
                <AppText size="sm" font="bold">
                    {month.format('MMMM YYYY')}
                </AppText>
                <Pressable
                    onPress={onNextMonth}
                    style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
                >
                    <ChevronRight size={20} color={COLORS.textSecondary} />
                </Pressable>
            </View>

            {/* Day-of-week headers */}
            <View className="flex-row px-2 mb-1">
                {DAY_HEADERS.map((d) => (
                    <View key={d} style={{ flex: 1, alignItems: 'center' }}>
                        <AppText size="xs" color="gray">{d}</AppText>
                    </View>
                ))}
            </View>

            {/* Grid */}
            <View className="px-2">
                {Array.from({ length: Math.ceil(grid.length / 7) }, (_, row) => (
                    <View key={row} className="flex-row mb-1">
                        {grid.slice(row * 7, row * 7 + 7).map((day, col) => {
                            if (!day) return <View key={col} style={{ flex: 1, height: 52 }} />;
                            const dateStr = day.format('YYYY-MM-DD');
                            return (
                                <DayCell
                                    key={dateStr}
                                    day={day}
                                    isSelected={dateStr === selectedDate.format('YYYY-MM-DD')}
                                    isToday={dateStr === today.format('YYYY-MM-DD')}
                                    careTypes={taskMap.get(dateStr)}
                                    onPress={() => onSelectDate(day)}
                                />
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>
    );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Run the app and verify**

- Open calendar — selection should spring animate when you tap different dates
- Dates with 3 care types should show 2 dots + `+1` label

- [ ] **Step 5: Commit**

```bash
git add src/components/screens/calendar/MonthCalendar.tsx
git commit -m "feat: add selection spring animation and dot overflow to MonthCalendar"
```

---

## Task 10: MonthCalendar — swipe navigation

**Files:**
- Modify: `src/components/screens/calendar/MonthCalendar.tsx`

- [ ] **Step 1: Add gesture imports**

Add to the imports at the top of `MonthCalendar.tsx`:

```ts
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
```

- [ ] **Step 2: Add swipe gesture to the calendar grid**

Inside `MonthCalendar`, add this before the `return`:

```ts
const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10]) // yield to ScrollView if user is scrolling vertically
    .onEnd((event) => {
        if (event.translationX < -50) {
            runOnJS(onNextMonth)();
        } else if (event.translationX > 50) {
            runOnJS(onPrevMonth)();
        }
    });
```

Wrap the entire returned `<View>` (the root `<View style={{ backgroundColor: '#fff', paddingBottom: 8 }}>`) with `<GestureDetector gesture={swipeGesture}>`:

```tsx
return (
    <GestureDetector gesture={swipeGesture}>
        <View style={{ backgroundColor: '#fff', paddingBottom: 8 }}>
            {/* ... existing content unchanged ... */}
        </View>
    </GestureDetector>
);
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Run the app and verify**

- Swipe left on the calendar grid — should advance to next month
- Swipe right — should go to previous month
- Chevron buttons still work

- [ ] **Step 5: Commit**

```bash
git add src/components/screens/calendar/MonthCalendar.tsx
git commit -m "feat: add swipe gesture navigation to MonthCalendar"
```

---

## Task 11: TaskCard — completion animation

**Files:**
- Modify: `src/components/screens/home/TaskCard.tsx`

- [ ] **Step 1: Replace TaskCard with animated version**

```tsx
import AppText from '@/src/components/core/AppText';
import { COLORS } from '@/src/constants/theme';
import { Task } from '@/src/utils/tasks';
import { Droplets, Flower2, RefreshCw, Check } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Image, Pressable, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

type Props = {
    task: Task;
    onComplete: (task: Task) => void;
    isCompleting?: boolean;
};

const CARE_COLORS: Record<string, string> = {
    WATER: '#4A9EE8',
    FERTILIZE: '#78B652',
    REPOT: '#A0714F',
};

const CARE_LABELS: Record<string, string> = {
    WATER: 'Water',
    FERTILIZE: 'Fertilize',
    REPOT: 'Repot',
};

function CareIcon({ type, size, color }: { type: string; size: number; color: string }) {
    if (type === 'WATER') return <Droplets size={size} color={color} />;
    if (type === 'FERTILIZE') return <Flower2 size={size} color={color} />;
    return <RefreshCw size={size} color={color} />;
}

export default function TaskCard({ task, onComplete, isCompleting }: Props) {
    const careColor = CARE_COLORS[task.type] ?? COLORS.primary;
    const checkScale = useSharedValue(0);
    const cardOpacity = useSharedValue(1);
    const cardTranslateX = useSharedValue(0);

    const checkStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkScale.value }],
        opacity: checkScale.value,
    }));

    const cardStyle = useAnimatedStyle(() => ({
        opacity: cardOpacity.value,
        transform: [{ translateX: cardTranslateX.value }],
    }));

    const handleComplete = useCallback(() => {
        // 1. Spring the checkmark in
        checkScale.value = withSpring(1, { damping: 12, stiffness: 200 });
        // 2. Haptic at the moment the check appears
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // 3. After 250ms, slide the card out and call onComplete
        cardOpacity.value = withTiming(0, { duration: 280 });
        cardTranslateX.value = withTiming(400, { duration: 280 }, (finished) => {
            if (finished) runOnJS(onComplete)(task);
        });
    }, [task, onComplete]);

    const displayLabel = task.title ?? CARE_LABELS[task.type];

    return (
        <Animated.View
            style={[
                {
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    borderWidth: 1,
                    borderColor: task.isOverdue ? '#FDDEDD' : COLORS.border,
                },
                cardStyle,
            ]}
        >
            {/* Plant photo or icon */}
            {task.plantPhotoUrl ? (
                <Image
                    source={{ uri: task.plantPhotoUrl }}
                    style={{ width: 48, height: 48, borderRadius: 12 }}
                    resizeMode="cover"
                />
            ) : (
                <View
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: `${careColor}20`,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <CareIcon type={task.type} size={22} color={careColor} />
                </View>
            )}

            {/* Task info */}
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <AppText size="sm" font="semiBold">
                        {task.plantName}
                    </AppText>
                    {task.isOverdue && (
                        <View
                            style={{
                                backgroundColor: '#FDDEDD',
                                borderRadius: 4,
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                            }}
                        >
                            <AppText size="xs" style={{ color: COLORS.error }}>
                                Overdue
                            </AppText>
                        </View>
                    )}
                </View>
                <View
                    style={{
                        alignSelf: 'flex-start',
                        backgroundColor: `${careColor}18`,
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                    }}
                >
                    <AppText size="xs" style={{ color: careColor }}>
                        {displayLabel}
                    </AppText>
                </View>
            </View>

            {/* Complete button */}
            <Pressable
                onPress={handleComplete}
                disabled={isCompleting}
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    borderWidth: 2,
                    borderColor: careColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                }}
            >
                <Animated.View style={[{ position: 'absolute' }, checkStyle]}>
                    <Check size={18} color={careColor} strokeWidth={3} />
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Run the app and verify**

- Tap the complete button on a task — checkmark should spring in, card should slide right and fade out, haptic fires
- The task should disappear from the list after the animation

- [ ] **Step 4: Commit**

```bash
git add src/components/screens/home/TaskCard.tsx
git commit -m "feat: add completion spring animation and checkmark to TaskCard"
```

---

## Task 12: TaskCard — ··· context menu

**Files:**
- Modify: `src/components/screens/home/TaskCard.tsx`
- Modify: `src/components/screens/home/TaskList.tsx`
- Modify: `src/app/(protected)/(tabs)/(calendar)/index.tsx`
- Modify: `src/app/(protected)/(tabs)/(home)/index.tsx`

- [ ] **Step 1: Add onOptions prop to TaskCard**

Add to the `Props` type in `TaskCard.tsx`:

```ts
type Props = {
    task: Task;
    onComplete: (task: Task) => void;
    isCompleting?: boolean;
    onOptions?: (task: Task) => void; // optional — hides ··· if not provided
};
```

Update the component signature:

```ts
export default function TaskCard({ task, onComplete, isCompleting, onOptions }: Props) {
```

Add the `···` button to the card, just before the complete button:

```tsx
{/* Options button */}
{onOptions && (
    <Pressable
        onPress={() => onOptions(task)}
        hitSlop={8}
        style={{ padding: 4 }}
    >
        <AppText size="sm" color="gray" style={{ letterSpacing: 1 }}>···</AppText>
    </Pressable>
)}
```

- [ ] **Step 2: Add onOptions prop to TaskList**

Open `src/components/screens/home/TaskList.tsx` and add `onOptions?: (task: Task) => void` to its props type. Pass it through to each `TaskCard`:

```tsx
// In TaskList props type:
type Props = {
    title?: string;
    tasks: Task[];
    onCompleteTask: (task: Task) => void;
    completingTaskId?: string;
    onOptions?: (task: Task) => void;
};

// In the TaskCard render:
<TaskCard
    key={task.id}
    task={task}
    onComplete={onCompleteTask}
    isCompleting={completingTaskId === task.id}
    onOptions={onOptions}
/>
```

- [ ] **Step 3: Add handleTaskOptions to calendar screen**

In `src/app/(protected)/(tabs)/(calendar)/index.tsx`, add these imports:

```ts
import { Alert } from 'react-native';
import { useUpdateCustomTask, useDeleteCustomTask } from '@/src/hooks/custom-tasks';
import { useUpdatePlant } from '@/src/hooks/plants';
import { router } from 'expo-router';
```

Add hooks inside `CalendarScreen`:

```ts
const updateCustomTask = useUpdateCustomTask();
const deleteCustomTask = useDeleteCustomTask();
const updatePlant = useUpdatePlant();
```

Add the handler:

```ts
const handleTaskOptions = (task: Task) => {
    const isCustom = task.source === 'custom';

    // Cross-platform reschedule: offer push-by options (Alert.prompt is iOS-only)
    const pushTask = (days: number) => {
        const newDate = dayjs(task.dueDate).add(days, 'day');
        if (isCustom && task.customTaskId) {
            updateCustomTask.mutate({
                id: task.customTaskId,
                payload: { dueDate: newDate.format('YYYY-MM-DD') },
            });
        } else if (task.plantId) {
            const plant = plants.find((p) => p.id === task.plantId);
            if (!plant) return;
            const intervalDays =
                task.type === 'WATER'
                    ? plant.wateringDays
                    : task.type === 'FERTILIZE'
                    ? plant.fertilizeDays
                    : plant.repotDays;
            if (!intervalDays) return;
            const newLastAt = newDate.subtract(intervalDays, 'day').toISOString();
            const fieldMap: Record<string, string> = {
                WATER: 'lastWateredAt',
                FERTILIZE: 'lastFertilizedAt',
                REPOT: 'lastRepottedAt',
            };
            updatePlant.mutate({
                id: task.plantId,
                payload: { [fieldMap[task.type]]: newLastAt } as any,
            });
        }
    };

    const reschedule = () => {
        Alert.alert('Reschedule task', 'Push to:', [
            { text: 'Tomorrow', onPress: () => pushTask(1) },
            { text: 'In 3 days', onPress: () => pushTask(3) },
            { text: 'Next week', onPress: () => pushTask(7) },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const buttons: Parameters<typeof Alert.alert>[2] = [
        { text: 'Reschedule', onPress: reschedule },
    ];

    if (!isCustom && task.plantId) {
        buttons.push({
            text: 'Edit plant schedule',
            onPress: () => router.push(`/(protected)/add-plant?plantId=${task.plantId}`),
        });
    }

    if (isCustom && task.customTaskId) {
        buttons.push({
            text: 'Delete task',
            style: 'destructive',
            onPress: () => deleteCustomTask.mutate(task.customTaskId!),
        });
    }

    buttons.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Task options', task.plantName, buttons);
};
```

Pass `onOptions={handleTaskOptions}` to `<TaskList>`:

```tsx
<TaskList
    title={taskSectionTitle}
    tasks={selectedDateTasks}
    onCompleteTask={handleCompleteTask}
    completingTaskId={completingTaskId ?? undefined}
    onOptions={handleTaskOptions}
/>
```

- [ ] **Step 4: Add handleTaskOptions to home screen**

Apply the same `handleTaskOptions` logic to `src/app/(protected)/(tabs)/(home)/index.tsx` — same implementation, same imports. Pass `onOptions={handleTaskOptions}` to `<TaskList>`.

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Run the app and verify**

- Tap `···` on an auto-generated task → Alert with "Reschedule" and "Edit plant schedule"
- Tap `···` on a custom task → Alert with "Reschedule" and "Delete task"
- Reschedule a custom task → task moves to new date on calendar
- Delete a custom task → task disappears from list and dot disappears from calendar

- [ ] **Step 7: Commit**

```bash
git add src/components/screens/home/TaskCard.tsx \
        src/components/screens/home/TaskList.tsx \
        "src/app/(protected)/(tabs)/(calendar)/index.tsx" \
        "src/app/(protected)/(tabs)/(home)/index.tsx"
git commit -m "feat: add task options menu with reschedule and delete actions"
```

---

## Final Verification

- [ ] `npx tsc --noEmit` — zero errors
- [ ] Add a custom task from the calendar FAB → appears in list + dot on calendar
- [ ] Complete an auto task → checkmark spring + slide-out + haptic
- [ ] Complete a custom task → same animation (mark completedAt via update)
- [ ] Reschedule a custom task → moves to new date
- [ ] Swipe calendar left/right → month changes
- [ ] Home screen shows merged auto + custom tasks
