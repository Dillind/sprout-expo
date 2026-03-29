import * as Notifications from 'expo-notifications';
import dayjs from 'dayjs';
import { CareType, Plant } from '@/src/types/db';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

function getNextDueDate(plant: Plant, type: CareType): Date | null {
    const intervalDays =
        type === 'WATER'
            ? plant.watering_days
            : type === 'FERTILIZE'
              ? plant.fertilize_days
              : plant.repot_days;

    if (!intervalDays) return null;

    const lastAt =
        type === 'WATER'
            ? plant.last_watered_at
            : type === 'FERTILIZE'
              ? plant.last_fertilized_at
              : plant.last_repotted_at;

    const base = lastAt ? dayjs(lastAt) : dayjs(plant.created_at);
    const nextDue = base.add(intervalDays, 'day').hour(9).minute(0).second(0).millisecond(0);

    // If next due is in the past, schedule for tomorrow at 9am
    if (nextDue.isBefore(dayjs())) {
        return dayjs().add(1, 'day').hour(9).minute(0).second(0).millisecond(0).toDate();
    }

    return nextDue.toDate();
}

function getNotificationContent(plant: Plant, type: CareType): { title: string; body: string } {
    const typeLabel = type === 'WATER' ? 'water' : type === 'FERTILIZE' ? 'fertilize' : 'repot';
    return {
        title: `Time to ${typeLabel} your ${plant.name}!`,
        body: `${plant.name} in ${plant.location} is due for ${typeLabel}ing today.`,
    };
}

export async function scheduleNextCareNotification(plant: Plant, type: CareType): Promise<void> {
    await cancelCareNotification(plant.id, type);

    if (!plant.reminders_enabled) return;

    const nextDue = getNextDueDate(plant, type);
    if (!nextDue) return;

    const content = getNotificationContent(plant, type);

    await Notifications.scheduleNotificationAsync({
        identifier: `${plant.id}-${type}`,
        content: {
            title: content.title,
            body: content.body,
            data: { plantId: plant.id, type },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: nextDue,
        },
    });
}

export async function cancelCareNotification(plantId: string, type: CareType): Promise<void> {
    try {
        await Notifications.cancelScheduledNotificationAsync(`${plantId}-${type}`);
    } catch {
        // Ignore errors if notification doesn't exist
    }
}

export async function cancelAllPlantNotifications(plantId: string): Promise<void> {
    const types: CareType[] = ['WATER', 'FERTILIZE', 'REPOT'];
    await Promise.all(types.map((type) => cancelCareNotification(plantId, type)));
}
