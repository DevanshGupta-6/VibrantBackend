import type { ActivityLogEntry } from "@/lib/types";

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityFeed({ entries }: { entries: ActivityLogEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-ink-900/50">No activity yet.</p>;
  }
  return (
    <ul className="divide-y divide-ink-900/10">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-start justify-between gap-4 py-3 text-sm">
          <p className="text-ink-900/80">
            <span className="font-medium text-ink-900">{entry.actor_name}</span>{" "}
            {entry.action} {entry.entity_type}
            {entry.entity_label ? <span className="text-ink-900/50"> · {entry.entity_label}</span> : null}
          </p>
          <span className="flex-none whitespace-nowrap text-xs text-ink-900/40">{timeAgo(entry.created_at)}</span>
        </li>
      ))}
    </ul>
  );
}
