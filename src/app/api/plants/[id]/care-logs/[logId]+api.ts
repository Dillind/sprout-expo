import { getUserId, notFound, unauthorized } from '@/src/app/api/_utils';
import prisma from '@/src/lib/prisma';
import { CareType } from '@prisma/client';

export async function DELETE(request: Request, { params }: { params: { id: string; logId: string } }) {
    try {
        const userId = await getUserId(request);
        if (!userId) return unauthorized();

        const log = await prisma.plantCareLog.findFirst({
            where: { id: params.logId, userId },
        });
        if (!log) return notFound();

        const lastAtField = {
            WATER: 'lastWateredAt',
            FERTILIZE: 'lastFertilizedAt',
            REPOT: 'lastRepottedAt',
        }[log.type as CareType];

        // Find the previous log of the same type to revert to
        const previousLog = await prisma.plantCareLog.findFirst({
            where: {
                plantId: log.plantId,
                type: log.type,
                doneAt: { lt: log.doneAt },
            },
            orderBy: { doneAt: 'desc' },
        });

        const revertValue = previousLog?.doneAt ?? null;

        const [, updatedPlant] = await prisma.$transaction([
            prisma.plantCareLog.delete({ where: { id: params.logId } }),
            prisma.plant.update({
                where: { id: log.plantId },
                data: { [lastAtField]: revertValue },
            }),
        ]);

        return Response.json({ plant: updatedPlant });
    } catch (error) {
        console.error('[API Error]', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
