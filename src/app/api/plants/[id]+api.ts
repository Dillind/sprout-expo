import { getUserId, notFound, unauthorized } from '@/src/app/api/_utils';
import prisma from '@/src/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = await getUserId(request);
        if (!userId) return unauthorized();

        const plant = await prisma.plant.findFirst({ where: { id: params.id, userId } });
        if (!plant) return notFound();

        return Response.json({ plant });
    } catch (error) {
        console.error('[API Error]', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = await getUserId(request);
        if (!userId) return unauthorized();

        const existing = await prisma.plant.findFirst({ where: { id: params.id, userId } });
        if (!existing) return notFound();

        const body = await request.json();
        // Only allow safe fields - never let callers overwrite userId, id, createdAt
        const {
            name,
            photoUrl,
            location,
            wateringDays,
            waterAmountMl,
            fertilizeDays,
            repotDays,
            remindersEnabled,
            lastWateredAt,
            lastFertilizedAt,
            lastRepottedAt,
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
                ...(lastWateredAt !== undefined && {
                    lastWateredAt: lastWateredAt ? new Date(lastWateredAt) : null,
                }),
                ...(lastFertilizedAt !== undefined && {
                    lastFertilizedAt: lastFertilizedAt ? new Date(lastFertilizedAt) : null,
                }),
                ...(lastRepottedAt !== undefined && {
                    lastRepottedAt: lastRepottedAt ? new Date(lastRepottedAt) : null,
                }),
            },
        });

        return Response.json({ plant });
    } catch (error) {
        console.error('[API Error]', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = await getUserId(request);
        if (!userId) return unauthorized();

        const existing = await prisma.plant.findFirst({ where: { id: params.id, userId } });
        if (!existing) return notFound();

        await prisma.plant.delete({ where: { id: params.id } });
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('[API Error]', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
