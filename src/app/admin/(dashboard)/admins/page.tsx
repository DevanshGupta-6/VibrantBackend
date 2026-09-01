import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { RoleControls } from "./RoleControls";
import type { AdminProfile } from "@/lib/types";

export default async function AdminsPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: admins } = await supabase
    .from("admin_profiles")
    .select("*")
    .order("created_at", { ascending: true });

  const list = (admins ?? []) as AdminProfile[];
  const pending = list.filter((a) => a.status === "pending");
  const active = list.filter((a) => a.status !== "pending");

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Admin users</h1>
      <p className="mt-1 text-sm text-ink-900/60">
        Assign roles to newly registered admins and manage who can access the dashboard.
      </p>

      {pending.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-lg text-ink-900">Awaiting approval</h2>
          <div className="mt-3 divide-y divide-ink-900/10 rounded-lg border border-ink-900/10 bg-white">
            {pending.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-medium text-ink-900">{admin.full_name}</p>
                  <p className="text-xs text-ink-900/50">{admin.email}</p>
                </div>
                <RoleControls admin={admin} isSelf={admin.id === user?.id} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="font-display text-lg text-ink-900">All admins</h2>
        <div className="mt-3 divide-y divide-ink-900/10 rounded-lg border border-ink-900/10 bg-white">
          {active.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-medium text-ink-900">
                  {admin.full_name} {admin.id === user?.id && <span className="text-ink-900/40">(you)</span>}
                </p>
                <p className="text-xs text-ink-900/50">{admin.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={admin.role === "SUPER_ADMIN" ? "accent" : "neutral"}>
                  {admin.role?.replace("_", " ") ?? "No role"}
                </Badge>
                <Badge tone={admin.status === "active" ? "success" : "warning"}>{admin.status}</Badge>
                <RoleControls admin={admin} isSelf={admin.id === user?.id} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
