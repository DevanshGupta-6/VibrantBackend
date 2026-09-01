import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { GalleryPhoto } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { UploadForm } from "./UploadForm";
import { GalleryGrid } from "./GalleryGrid";

export default async function GalleryAdminPage() {
  const supabase = createServerSupabaseClient();
  const { data: photos } = await supabase.from("gallery_photos").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Gallery</h1>
      <p className="mt-1 text-sm text-ink-900/60">
        Photos here are visible to the public on the fest site's gallery page.
      </p>

      <Card className="mt-6">
        <UploadForm />
      </Card>

      <div className="mt-6">
        <GalleryGrid photos={(photos ?? []) as GalleryPhoto[]} />
      </div>
    </div>
  );
}
