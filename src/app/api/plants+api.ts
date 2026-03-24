import { getUserId, unauthorized } from '@/src/app/api/_utils';
import prisma from '@/src/lib/prisma';

export async function GET(request: Request) {
    try {
        const userId = await getUserId(request);
        if (!userId) return unauthorized();

        const plants = await prisma.plant.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return Response.json({ plants });
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
        const { name, photoUrl, location, wateringDays, remindersEnabled } = body;

        if (!name || !location) {
            return Response.json({ error: 'name and location are required' }, { status: 400 });
        }

        const plant = await prisma.plant.create({
            data: {
                userId,
                name,
                photoUrl: photoUrl ?? null,
                location,
                wateringDays: wateringDays ?? 7,
                remindersEnabled: remindersEnabled ?? false,
            },
        });

        return Response.json({ plant }, { status: 201 });
    } catch (error) {
        console.error('[API Error]', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
