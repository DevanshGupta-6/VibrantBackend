import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/StatsCard";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import type { ActivityLogEntry } from "@/lib/types";

export default async function DashboardOverviewPage() {
  const supabase = createServerSupabaseClient();

  const [events, photos, sponsors, activity] = await Promise.all([
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("gallery_photos").select("id", { count: "exact", head: true }),
    supabase.from("sponsors").select("id", { count: "exact", head: true }),
    supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(15)
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Overview</h1>
      <p className="mt-1 text-sm text-ink-900/60">What's live on the fest site right now.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatsCard label="Events" value={events.count ?? 0} />
        <StatsCard label="Gallery photos" value={photos.count ?? 0} />
        <StatsCard label="Sponsors" value={sponsors.count ?? 0} />
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg text-ink-900">Recent activity</h2>
        <div className="mt-3 rounded-lg border border-ink-900/10 bg-white p-4">
          <ActivityFeed entries={(activity.data ?? []) as ActivityLogEntry[]} />
        </div>
      </div>
    </div>
  );
}
