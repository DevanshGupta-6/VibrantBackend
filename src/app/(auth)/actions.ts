"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { logActivity } from "@/lib/activityLog";

function clientIdentifier(email: string) {
  // Rate-limit on email primarily; fold in the caller's IP so one bad actor
  // can't rotate through email addresses to dodge the window entirely.
  const ip = headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return `${email.toLowerCase()}|${ip}`;
}

export async function loginAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/admin");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const { allowed, retryAfterSeconds } = await checkRateLimit(clientIdentifier(email), "login");
  if (!allowed) {
    const minutes = Math.ceil(retryAfterSeconds / 60);
    return { error: `Too many attempts. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.` };
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Incorrect email or password." };
  }

  redirect(redirectTo);
}

export async function registerAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!email || !password || !fullName) {
    return { error: "Fill in your name, email, and password." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const { allowed, retryAfterSeconds } = await checkRateLimit(clientIdentifier(email), "register");
  if (!allowed) {
    const minutes = Math.ceil(retryAfterSeconds / 60);
    return { error: `Too many attempts. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.` };
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    return { error: error?.message ?? "Could not create your account." };
  }

  // Auto-approve a configured bootstrap list of super admins so the first
  // person can always get into an otherwise-empty dashboard; everyone else
  // lands as 'pending' until a SUPER_ADMIN assigns them a role.
  const bootstrapEmails = (process.env.INITIAL_SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isBootstrap = bootstrapEmails.includes(email.toLowerCase());

  const service = createServiceRoleClient();
  const { error: profileError } = await service.from("admin_profiles").insert({
    id: data.user.id,
    email,
    full_name: fullName,
    role: isBootstrap ? "SUPER_ADMIN" : null,
    status: isBootstrap ? "active" : "pending"
  });

  if (profileError) {
    return { error: "Account created, but the admin profile could not be set up. Contact a super admin." };
  }

  await logActivity({
    actorId: data.user.id,
    actorName: fullName,
    action: isBootstrap ? "registered (auto-approved as super admin)" : "requested access",
    entityType: "admin"
  });

  redirect(isBootstrap ? "/admin" : "/admin/pending");
}
