"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activityLog";
import { can } from "@/lib/rbac";
import type { AdminProfile } from "@/lib/types";

async function requireEventPermission() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data: profile } = await supabase.from("admin_profiles").select("*").eq("id", user.id).single();
  if (!can(profile as AdminProfile, "MANAGE_EVENTS")) {
    throw new Error("You don't have permission to manage events.");
  }
  return { supabase, profile: profile as AdminProfile };
}

export async function createEventAction(formData: FormData) {
  const { supabase, profile } = await requireEventPermission();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "General").trim();
  const venue = String(formData.get("venue") ?? "").trim() || null;
  const startTime = String(formData.get("start_time") ?? "");
  const endTime = String(formData.get("end_time") ?? "") || null;

  if (!title || !startTime) throw new Error("Title and start time are required.");

  const { error } = await supabase.from("events").insert({
    title,
    description,
    category,
    venue,
    start_time: new Date(startTime).toISOString(),
    end_time: endTime ? new Date(endTime).toISOString() : null,
    created_by: profile.id
  });
  if (error) throw new Error(error.message);

  await logActivity({ actorId: profile.id, actorName: profile.full_name, action: "created", entityType: "event", entityLabel: title });

  revalidatePath("/admin/events");
  revalidatePath("/admin");
  revalidatePath("/"); // public homepage lists upcoming events
}

export async function updateEventAction(eventId: string, formData: FormData) {
  const { supabase, profile } = await requireEventPermission();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "General").trim();
  const venue = String(formData.get("venue") ?? "").trim() || null;
  const startTime = String(formData.get("start_time") ?? "");
  const endTime = String(formData.get("end_time") ?? "") || null;
  const isPublished = formData.get("is_published") === "on";

  const { error } = await supabase
    .from("events")
    .update({
      title,
      description,
      category,
      venue,
      start_time: new Date(startTime).toISOString(),
      end_time: endTime ? new Date(endTime).toISOString() : null,
      is_published: isPublished
    })
    .eq("id", eventId);
  if (error) throw new Error(error.message);

  await logActivity({ actorId: profile.id, actorName: profile.full_name, action: "updated", entityType: "event", entityLabel: title });

  revalidatePath("/admin/events");
  revalidatePath("/");
}

export async function deleteEventAction(eventId: string, title: string) {
  const { supabase, profile } = await requireEventPermission();

  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw new Error(error.message);

  await logActivity({ actorId: profile.id, actorName: profile.full_name, action: "deleted", entityType: "event", entityLabel: title });

  revalidatePath("/admin/events");
  revalidatePath("/admin");
  revalidatePath("/");
}
