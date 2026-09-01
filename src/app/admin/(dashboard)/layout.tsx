import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/admin/Sidebar";
import type { AdminProfile } from "@/lib/types";

/**
 * Shared shell for every /admin/* page (except /admin/pending, which
 * renders on its own since a pending user has no profile to build a
 * sidebar from). Middleware has already confirmed session + active role
 * by the time a request reaches here — this just fetches the profile once
 * so every page and the sidebar can use it.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.status !== "active" || !profile.role) {
    redirect("/admin/pending");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar profile={profile as AdminProfile} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">{children}</div>
      </div>
    </div>
  );
}
