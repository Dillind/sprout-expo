import { getUserId, notFound, unauthorized } from '@/src/app/api/_utils';
import prisma from '@/src/lib/prisma';
import { CareType } from '@prisma/client';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = await getUserId(request);
        if (!userId) return unauthorized();

        const plant = await prisma.plant.findFirst({ where: { id: params.id, userId } });
        if (!plant) return notFound();

        const body = await request.json();
        const { type, doneAt } = body;

        const validTypes: CareType[] = ['WATER', 'FERTILIZE', 'REPOT'];
        if (!validTypes.includes(type)) {
            return Response.json({ error: 'Invalid care type' }, { status: 400 });
        }

        const resolvedDoneAt = doneAt ? new Date(doneAt) : new Date();

        // Map type to Plant field to update
        const lastAtField = {
            WATER: 'lastWateredAt',
            FERTILIZE: 'lastFertilizedAt',
            REPOT: 'lastRepottedAt',
        }[type as CareType];

        const [log, updatedPlant] = await prisma.$transaction([
            prisma.plantCareLog.create({
                data: { plantId: params.id, userId, type, doneAt: resolvedDoneAt },
            }),
            prisma.plant.update({
                where: { id: params.id },
                data: { [lastAtField]: resolvedDoneAt },
            }),
        ]);

        return Response.json({ log, plant: updatedPlant }, { status: 201 });
    } catch (error) {
        console.error('[API Error]', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
