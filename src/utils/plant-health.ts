import dayjs from 'dayjs';
import { Plant } from '@/src/types/db';

export type HealthStatus = 'Thriving' | 'Okay' | 'Struggling';

export const HEALTH_COLORS: Record<HealthStatus, string> = {
    Thriving: '#78B652',
    Okay: '#F5A623',
    Struggling: '#E85D4A',
};

function maxOverdueDays(plant: Plant): number {
    const today = dayjs().startOf('day');
    const checks = [
        { intervalDays: plant.watering_days, lastAt: plant.last_watered_at ?? null },
        { intervalDays: plant.fertilize_days ?? null, lastAt: plant.last_fertilized_at ?? null },
        { intervalDays: plant.repot_days ?? null, lastAt: plant.last_repotted_at ?? null },
    ];
    let max = 0;
    for (const { intervalDays, lastAt } of checks) {
        if (!intervalDays) continue;
        const base = lastAt
            ? dayjs(lastAt).startOf('day')
            : dayjs(plant.created_at).startOf('day');
        const nextDue = base.add(intervalDays, 'day');
        if (nextDue.isBefore(today)) {
            max = Math.max(max, today.diff(nextDue, 'day'));
        }
    }
    return max;
}

export function getPlantHealth(plant: Plant): HealthStatus {
    const overdue = maxOverdueDays(plant);
    if (overdue === 0) return 'Thriving';
    if (overdue <= 3) return 'Okay';
    return 'Struggling';
}

/** Returns label like "Overdue 2d", "Today", "In 3d" for the next watering */
export function getNextWaterLabel(plant: Plant): string {
    const today = dayjs().startOf('day');
    const base = plant.last_watered_at
        ? dayjs(plant.last_watered_at).startOf('day')
        : dayjs(plant.created_at).startOf('day');
    const nextDue = base.add(plant.watering_days, 'day');
    const diff = nextDue.diff(today, 'day');
    if (diff < 0) return `Overdue ${Math.abs(diff)}d`;
    if (diff === 0) return 'Today';
    return `In ${diff}d`;
}

export function isWaterUrgent(plant: Plant): boolean {
    const today = dayjs().startOf('day');
    const base = plant.last_watered_at
        ? dayjs(plant.last_watered_at).startOf('day')
        : dayjs(plant.created_at).startOf('day');
    return !base.add(plant.watering_days, 'day').isAfter(today);
}

/** Sort: overdue first, then due today, then alphabetical */
export function sortPlantsByUrgency(plants: Plant[]): Plant[] {
    const today = dayjs().startOf('day');
    const score = (p: Plant) => {
        const base = p.last_watered_at
            ? dayjs(p.last_watered_at).startOf('day')
            : dayjs(p.created_at).startOf('day');
        const nextDue = base.add(p.watering_days, 'day');
        if (nextDue.isBefore(today)) return 0;
        if (nextDue.isSame(today)) return 1;
        return 2;
    };
    return [...plants].sort((a, b) => {
        const diff = score(a) - score(b);
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name);
    });
}
