import { Card } from "@/components/ui/Card";

export function StatsCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-wide text-ink-900/50">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink-900">{value}</p>
    </Card>
  );
}
