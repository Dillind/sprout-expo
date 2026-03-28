import { getUserId, notFound, unauthorized } from '@/src/app/api/_utils';
import prisma from '@/src/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = await getUserId(request);
        if (!userId) return unauthorized();

        const task = await prisma.customTask.findFirst({
            where: { id: params.id, userId },
        });
        if (!task) return notFound();

        const body = await request.json();
        const { dueDate, completedAt } = body;

        const data: Record<string, unknown> = {};
        if (dueDate !== undefined) data.dueDate = new Date(dueDate);
        if (completedAt !== undefined) {
            data.completedAt = completedAt ? new Date(completedAt) : null;
        }

        const customTask = await prisma.customTask.update({
            where: { id: params.id },
            data,
        });

        return Response.json({ customTask });
    } catch (error) {
        console.error('[API Error]', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = await getUserId(request);
        if (!userId) return unauthorized();

        const task = await prisma.customTask.findFirst({
            where: { id: params.id, userId },
        });
        if (!task) return notFound();

        await prisma.customTask.delete({ where: { id: params.id } });

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('[API Error]', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
