"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activityLog";
import { can } from "@/lib/rbac";
import type { AdminProfile } from "@/lib/types";

async function requireFaqPermission() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data: profile } = await supabase.from("admin_profiles").select("*").eq("id", user.id).single();
  if (!can(profile as AdminProfile, "MANAGE_FAQS")) {
    throw new Error("You don't have permission to manage FAQs.");
  }
  return { supabase, profile: profile as AdminProfile };
}

export async function addFaqAction(formData: FormData) {
  const { supabase, profile } = await requireFaqPermission();

  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) throw new Error("Both a question and an answer are required.");

  const { count } = await supabase.from("faqs").select("id", { count: "exact", head: true });

  const { error } = await supabase.from("faqs").insert({
    question,
    answer,
    display_order: count ?? 0,
    created_by: profile.id
  });
  if (error) throw new Error(error.message);

  await logActivity({ actorId: profile.id, actorName: profile.full_name, action: "added", entityType: "FAQ", entityLabel: question });

  revalidatePath("/admin/faqs");
  revalidatePath("/");
}

export async function updateFaqAction(faqId: string, formData: FormData) {
  const { supabase, profile } = await requireFaqPermission();

  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();

  const { error } = await supabase.from("faqs").update({ question, answer }).eq("id", faqId);
  if (error) throw new Error(error.message);

  await logActivity({ actorId: profile.id, actorName: profile.full_name, action: "updated", entityType: "FAQ", entityLabel: question });

  revalidatePath("/admin/faqs");
  revalidatePath("/");
}

export async function deleteFaqAction(faqId: string, question: string) {
  const { supabase, profile } = await requireFaqPermission();

  const { error } = await supabase.from("faqs").delete().eq("id", faqId);
  if (error) throw new Error(error.message);

  await logActivity({ actorId: profile.id, actorName: profile.full_name, action: "deleted", entityType: "FAQ", entityLabel: question });

  revalidatePath("/admin/faqs");
  revalidatePath("/");
}
