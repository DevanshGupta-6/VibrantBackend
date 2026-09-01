import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { GalleryPhoto } from "@/lib/types";

export const revalidate = 60;

export default async function PublicGalleryPage() {
  const supabase = createServerSupabaseClient();
  const { data: photos } = await supabase
    .from("gallery_photos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-paper px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl text-ink-900">Gallery</h1>
        <p className="mt-2 text-sm text-ink-900/60">Moments from Zenith Fest, as they happen.</p>

        {photos && photos.length > 0 ? (
          <div className="mt-8 columns-2 gap-4 md:columns-3">
            {(photos as GalleryPhoto[]).map((photo) => (
              <figure key={photo.id} className="mb-4 break-inside-avoid overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.caption ?? ""} className="w-full" />
                {photo.caption && (
                  <figcaption className="mt-1 text-xs text-ink-900/50">{photo.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-sm text-ink-900/50">No photos yet — check back once the fest kicks off.</p>
        )}
      </div>
    </main>
  );
}
