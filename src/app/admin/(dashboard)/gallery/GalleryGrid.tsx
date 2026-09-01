"use client";

import { useTransition } from "react";
import { deletePhotoAction } from "./actions";
import type { GalleryPhoto } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [isPending, startTransition] = useTransition();

  if (photos.length === 0) {
    return <p className="py-6 text-sm text-ink-900/50">No photos yet — upload the first one above.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {photos.map((photo) => (
        <div key={photo.id} className="group relative overflow-hidden rounded-lg border border-ink-900/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt={photo.caption ?? ""} className="aspect-square w-full object-cover" />
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink-900/70 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="danger"
              className="w-full px-2 py-1 text-xs"
              disabled={isPending}
              onClick={() => {
                if (confirm("Delete this photo?")) {
                  startTransition(() => deletePhotoAction(photo.id, photo.storage_path));
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
