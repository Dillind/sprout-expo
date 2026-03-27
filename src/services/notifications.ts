import * as Notifications from 'expo-notifications';
import dayjs from 'dayjs';
import { Plant } from '@/src/api/plants';
import { CareType } from '@/src/api/care-logs';

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
    const intervalDays = type === 'WATER'
        ? plant.wateringDays
        : type === 'FERTILIZE'
        ? plant.fertilizeDays
        : plant.repotDays;

    if (!intervalDays) return null;

    const lastAt = type === 'WATER'
        ? plant.lastWateredAt
        : type === 'FERTILIZE'
        ? plant.lastFertilizedAt
        : plant.lastRepottedAt;

    const base = lastAt ? dayjs(lastAt) : dayjs(plant.createdAt);
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
    // Cancel any existing notification for this plant+type
    await cancelCareNotification(plant.id, type);

    if (!plant.remindersEnabled) return;

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
