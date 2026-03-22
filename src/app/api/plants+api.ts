import prisma from '@/src/lib/prisma';
import { getUserId, unauthorized } from './_utils';

export async function GET(request: Request) {
    const userId = await getUserId(request);
    if (!userId) return unauthorized();

    const plants = await prisma.plant.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });

    return Response.json({ plants });
}

export async function POST(request: Request) {
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
}
