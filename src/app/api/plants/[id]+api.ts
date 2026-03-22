import prisma from '@/src/lib/prisma';
import { getUserId, unauthorized, notFound } from '../_utils';

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
        const { name, photoUrl, location, wateringDays, remindersEnabled } = body;
        const plant = await prisma.plant.update({
            where: { id: params.id },
            data: {
                ...(name !== undefined && { name }),
                ...(photoUrl !== undefined && { photoUrl }),
                ...(location !== undefined && { location }),
                ...(wateringDays !== undefined && { wateringDays }),
                ...(remindersEnabled !== undefined && { remindersEnabled }),
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
