import supabaseAdmin from '@/src/lib/supabase-admin';

export async function getUserId(request: Request): Promise<string | null> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7);
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;

    return user.id;
}

export function unauthorized() {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

export function notFound() {
    return Response.json({ error: 'Not found' }, { status: 404 });
}
