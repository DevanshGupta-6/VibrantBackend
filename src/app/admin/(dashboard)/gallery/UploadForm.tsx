"use client";

import { useRef, useTransition, useState } from "react";
import { uploadPhotoAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

export function UploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <form
      ref={formRef}
      action={(formData) =>
        startTransition(async () => {
          setError(undefined);
          try {
            await uploadPhotoAction(formData);
            formRef.current?.reset();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Upload failed.");
          }
        })
      }
      className="flex flex-wrap items-end gap-3"
    >
      <label className="text-sm">
        <span className="block text-ink-900/70">Photo</span>
        <input type="file" name="photo" accept="image/*" required className="mt-1 text-sm" />
      </label>
      <label className="flex-1 text-sm">
        <span className="block text-ink-900/70">Caption (optional)</span>
        <input
          type="text"
          name="caption"
          className="focus-ring mt-1 w-full rounded-md border border-ink-900/15 px-3 py-2"
        />
      </label>
      <Button type="submit" disabled={isPending}>{isPending ? "Uploading…" : "Upload"}</Button>
      <FormError message={error} />
    </form>
  );
}
