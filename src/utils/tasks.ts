import dayjs, { Dayjs } from 'dayjs';
import { Plant } from '@/src/api/plants';
import type { CareType } from '@/src/api/care-logs';
export type { CareType };

export type Task = {
    /** Deterministic ID: `{plantId}-{type}-{YYYY-MM-DD}` or `{plantId}-{type}-overdue` for auto tasks; `custom-{id}` for custom tasks */
    id: string;
    plantId: string | null;
    plantName: string; // falls back to task title when no plant linked
    plantPhotoUrl: string | null;
    type: CareType;
    /** ISO date-time string */
    dueDate: string;
    isOverdue: boolean;
    source: 'auto' | 'custom';
    customTaskId?: string; // set when source === 'custom'
    title?: string;        // custom task label, shown in place of care type label when set
};

/** Get the Monday of the week containing the given date (locale-independent) */
export function getWeekMonday(date: Dayjs): Dayjs {
    return date.subtract((date.day() + 6) % 7, 'day').startOf('day');
}

/**
 * Generate all care tasks for the given plants within [rangeStart, rangeEnd].
 * Overdue tasks (past nextDue) are pinned to rangeStart with isOverdue=true.
 * One overdue task per plant+type (not stacked).
 */
export function generateTasks(plants: Plant[], rangeStart: Dayjs, rangeEnd: Dayjs): Task[] {
    const tasks: Task[] = [];

    for (const plant of plants) {
        const careConfigs: Array<{
            type: CareType;
            intervalDays: number | null;
            lastAt: string | null;
        }> = [
            {
                type: 'WATER',
                intervalDays: plant.wateringDays,
                lastAt: plant.lastWateredAt ?? null,
            },
            {
                type: 'FERTILIZE',
                intervalDays: plant.fertilizeDays ?? null,
                lastAt: plant.lastFertilizedAt ?? null,
            },
            {
                type: 'REPOT',
                intervalDays: plant.repotDays ?? null,
                lastAt: plant.lastRepottedAt ?? null,
            },
        ];

        for (const { type, intervalDays, lastAt } of careConfigs) {
            if (!intervalDays) continue;

            const base = lastAt
                ? dayjs(lastAt).startOf('day')
                : dayjs(plant.createdAt).startOf('day');

            let nextDue = base.add(intervalDays, 'day');

            // If overdue (nextDue before rangeStart), pin to rangeStart
            if (nextDue.isBefore(rangeStart)) {
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
                continue;
            }

            // Generate recurring instances within [rangeStart, rangeEnd]
            while (!nextDue.isAfter(rangeEnd)) {
                if (!nextDue.isBefore(rangeStart)) {
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
                }
                nextDue = nextDue.add(intervalDays, 'day');
            }
        }
    }

    return tasks;
}

/** Get all tasks for a specific date (day-level match) */
export function getTasksForDate(tasks: Task[], date: Dayjs): Task[] {
    const dateStr = date.format('YYYY-MM-DD');
    return tasks.filter((t) => dayjs(t.dueDate).format('YYYY-MM-DD') === dateStr);
}

/** Get all dates (as 'YYYY-MM-DD' strings) that have at least one task */
export function getDatesWithTasks(tasks: Task[], rangeStart: Dayjs, rangeEnd: Dayjs): string[] {
    const dateSet = new Set<string>();
    for (const task of tasks) {
        const d = dayjs(task.dueDate).format('YYYY-MM-DD');
        const taskDay = dayjs(d);
        if (!taskDay.isBefore(rangeStart) && !taskDay.isAfter(rangeEnd)) {
            dateSet.add(d);
        }
    }
    return Array.from(dateSet).sort();
}

/** Get a map of date → Set<CareType> for calendar dot rendering */
export function getTasksByDateTypeMap(tasks: Task[]): Map<string, Set<CareType>> {
    const map = new Map<string, Set<CareType>>();
    for (const task of tasks) {
        const d = dayjs(task.dueDate).format('YYYY-MM-DD');
        if (!map.has(d)) map.set(d, new Set());
        map.get(d)!.add(task.type);
    }
    return map;
}

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
