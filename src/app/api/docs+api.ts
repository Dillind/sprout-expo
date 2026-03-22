import spec from '../../../openapi.json';

export async function GET() {
    return Response.json(spec);
}
