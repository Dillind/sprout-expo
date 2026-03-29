import supabase from '@/src/lib/supabase';

const BUCKET = 'plant-photos';

/**
 * Returns a Supabase transform URL for a plant photo at the requested dimensions.
 *
 * Handles two formats stored in the DB:
 *  - Storage path (new):  "userId/1234567890.jpg"
 *  - Legacy full URL:     "https://…/object/public/plant-photos/userId/123.jpg"
 */
export function getPlantPhotoUrl(
    photoUrl: string | null | undefined,
    width: number,
    height: number,
): string | null {
    if (!photoUrl) return null;

    let path = photoUrl;

    // Legacy: full public URL — extract path after the bucket segment
    if (photoUrl.startsWith('http')) {
        const marker = `/object/public/${BUCKET}/`;
        const idx = photoUrl.indexOf(marker);
        if (idx === -1) return photoUrl; // unknown format, pass through
        path = photoUrl.slice(idx + marker.length);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path, {
        transform: { width, height, resize: 'cover' },
    });
    return data.publicUrl;
}
