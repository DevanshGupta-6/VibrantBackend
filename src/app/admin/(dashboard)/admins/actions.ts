"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activityLog";
import type { AdminRole, AdminStatus } from "@/lib/types";

async function requireSuperAdmin() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Defense in depth: the route is already gated by middleware, but every
  // mutation re-checks the role server-side too, exactly like "Verify Role"
  // does before the Prisma/DB write in the architecture diagram.
  if (!profile || profile.status !== "active" || profile.role !== "SUPER_ADMIN") {
    throw new Error("Only super admins can manage admin users.");
  }
  return { supabase, profile };
}

export async function setAdminRoleAction(adminId: string, role: AdminRole) {
  const { supabase, profile } = await requireSuperAdmin();

  const { data: target, error } = await supabase
    .from("admin_profiles")
    .update({ role, status: "active" })
    .eq("id", adminId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    actorName: profile.full_name,
    action: `assigned the ${role.replace("_", " ")} role to`,
    entityType: "admin",
    entityLabel: target?.full_name ?? target?.email
  });

  revalidatePath("/admin/admins");
  revalidatePath("/admin");
}

export async function setAdminStatusAction(adminId: string, status: AdminStatus) {
  const { supabase, profile } = await requireSuperAdmin();

  if (adminId === profile.id && status !== "active") {
    throw new Error("You can't suspend your own account.");
  }

  const { data: target, error } = await supabase
    .from("admin_profiles")
    .update({ status })
    .eq("id", adminId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    actorName: profile.full_name,
    action: status === "active" ? "activated" : status === "suspended" ? "suspended" : "updated",
    entityType: "admin",
    entityLabel: target?.full_name ?? target?.email
  });

  revalidatePath("/admin/admins");
  revalidatePath("/admin");
}
