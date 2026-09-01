"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activityLog";
import { can } from "@/lib/rbac";
import type { AdminProfile } from "@/lib/types";

const BUCKET = "fest-media";

async function requireGalleryPermission() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data: profile } = await supabase.from("admin_profiles").select("*").eq("id", user.id).single();
  if (!can(profile as AdminProfile, "MANAGE_GALLERY")) {
    throw new Error("You don't have permission to manage the gallery.");
  }
  return { supabase, profile: profile as AdminProfile };
}

export async function uploadPhotoAction(formData: FormData) {
  const { supabase, profile } = await requireGalleryPermission();

  const file = formData.get("photo") as File | null;
  const caption = String(formData.get("caption") ?? "").trim() || null;

  if (!file || file.size === 0) throw new Error("Choose a photo to upload.");
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Images must be under 8MB.");

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `gallery/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false
  });
  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { error } = await supabase.from("gallery_photos").insert({
    url: publicUrl.publicUrl,
    storage_path: path,
    caption,
    uploaded_by: profile.id
  });
  if (error) throw new Error(error.message);

  await logActivity({ actorId: profile.id, actorName: profile.full_name, action: "added a photo to", entityType: "gallery", entityLabel: caption ?? undefined });

  revalidatePath("/admin/gallery");
  revalidatePath("/admin");
  revalidatePath("/gallery");
}

export async function deletePhotoAction(photoId: string, storagePath: string) {
  const { supabase, profile } = await requireGalleryPermission();

  await supabase.storage.from(BUCKET).remove([storagePath]);
  const { error } = await supabase.from("gallery_photos").delete().eq("id", photoId);
  if (error) throw new Error(error.message);

  await logActivity({ actorId: profile.id, actorName: profile.full_name, action: "removed a photo from", entityType: "gallery" });

  revalidatePath("/admin/gallery");
  revalidatePath("/admin");
  revalidatePath("/gallery");
}
