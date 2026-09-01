"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activityLog";
import { can } from "@/lib/rbac";
import type { AdminProfile } from "@/lib/types";

async function requireSponsorPermission() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data: profile } = await supabase.from("admin_profiles").select("*").eq("id", user.id).single();
  if (!can(profile as AdminProfile, "MANAGE_SPONSORS")) {
    throw new Error("Only super admins can manage sponsors.");
  }
  return { supabase, profile: profile as AdminProfile };
}

export async function addSponsorAction(formData: FormData) {
  const { supabase, profile } = await requireSponsorPermission();

  const name = String(formData.get("name") ?? "").trim();
  const tier = String(formData.get("tier") ?? "Silver");
  const websiteUrl = String(formData.get("website_url") ?? "").trim() || null;
  const logoUrl = String(formData.get("logo_url") ?? "").trim() || null;

  if (!name) throw new Error("Sponsor name is required.");

  const { error } = await supabase.from("sponsors").insert({
    name,
    tier,
    website_url: websiteUrl,
    logo_url: logoUrl,
    created_by: profile.id
  });
  if (error) throw new Error(error.message);

  await logActivity({ actorId: profile.id, actorName: profile.full_name, action: "added", entityType: "sponsor", entityLabel: name });

  revalidatePath("/admin/sponsors");
  revalidatePath("/admin");
}

export async function deleteSponsorAction(sponsorId: string, name: string) {
  const { supabase, profile } = await requireSponsorPermission();

  const { error } = await supabase.from("sponsors").delete().eq("id", sponsorId);
  if (error) throw new Error(error.message);

  await logActivity({ actorId: profile.id, actorName: profile.full_name, action: "removed", entityType: "sponsor", entityLabel: name });

  revalidatePath("/admin/sponsors");
  revalidatePath("/admin");
}
