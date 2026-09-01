import { createServiceRoleClient } from "./supabase/server";

/**
 * Records a line in the Recent Activity feed shown on the dashboard.
 * Uses the service-role client so a write never gets blocked by RLS and
 * always succeeds even if it's logging something like an admin being
 * suspended (which just changed the actor's own read access).
 */
export async function logActivity(params: {
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityLabel?: string;
}) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("activity_log").insert({
    actor_id: params.actorId,
    actor_name: params.actorName,
    action: params.action,
    entity_type: params.entityType,
    entity_label: params.entityLabel ?? null
  });
  if (error) {
    // Never let logging failures break the actual mutation the user asked for.
    console.error("Failed to write activity log:", error.message);
  }
}
