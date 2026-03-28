import { getUserId, unauthorized } from '@/src/app/api/_utils';
import prisma from '@/src/lib/prisma';
import { CareType } from '@prisma/client';

export async function GET(request: Request) {
    try {
        const userId = await getUserId(request);
        if (!userId) return unauthorized();

        const url = new URL(request.url);
        const rangeStart = url.searchParams.get('rangeStart');
        const rangeEnd = url.searchParams.get('rangeEnd');

        const where: Record<string, unknown> = { userId, completedAt: null };

        if (rangeStart && rangeEnd) {
            where.dueDate = {
                gte: new Date(rangeStart),
                lte: new Date(rangeEnd),
            };
        }

        const customTasks = await prisma.customTask.findMany({
            where,
            orderBy: { dueDate: 'asc' },
        });

        return Response.json({ customTasks });
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
        const { plantId, title, type, dueDate } = body;

        if (!title || typeof title !== 'string' || !title.trim()) {
            return Response.json({ error: 'Title is required' }, { status: 400 });
        }

        const validTypes: CareType[] = ['WATER', 'FERTILIZE', 'REPOT'];
        if (!validTypes.includes(type)) {
            return Response.json({ error: 'Invalid care type' }, { status: 400 });
        }

        if (!dueDate) {
            return Response.json({ error: 'dueDate is required' }, { status: 400 });
        }

        const customTask = await prisma.customTask.create({
            data: {
                userId,
                plantId: plantId ?? null,
                title: title.trim(),
                type,
                dueDate: new Date(dueDate),
            },
        });

        return Response.json({ customTask }, { status: 201 });
    } catch (error) {
        console.error('[API Error]', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
