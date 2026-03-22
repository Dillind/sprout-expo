import prisma from '@/src/lib/prisma';
import { getUserId, unauthorized, notFound } from '../_utils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const userId = await getUserId(request);
    if (!userId) return unauthorized();

    const plant = await prisma.plant.findFirst({ where: { id: params.id, userId } });
    if (!plant) return notFound();

    return Response.json({ plant });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const userId = await getUserId(request);
    if (!userId) return unauthorized();

    const existing = await prisma.plant.findFirst({ where: { id: params.id, userId } });
    if (!existing) return notFound();

    const body = await request.json();
    const plant = await prisma.plant.update({ where: { id: params.id }, data: body });

    return Response.json({ plant });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const userId = await getUserId(request);
    if (!userId) return unauthorized();

    const existing = await prisma.plant.findFirst({ where: { id: params.id, userId } });
    if (!existing) return notFound();

    await prisma.plant.delete({ where: { id: params.id } });
    return new Response(null, { status: 204 });
}
