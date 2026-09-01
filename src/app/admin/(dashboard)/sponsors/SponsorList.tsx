"use client";

import { useTransition } from "react";
import { deleteSponsorAction } from "./actions";
import type { Sponsor } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function SponsorList({ sponsors }: { sponsors: Sponsor[] }) {
  const [isPending, startTransition] = useTransition();

  if (sponsors.length === 0) {
    return <p className="py-6 text-sm text-ink-900/50">No sponsors yet — add the first one above.</p>;
  }

  return (
    <div className="divide-y divide-ink-900/10">
      {sponsors.map((sponsor) => (
        <div key={sponsor.id} className="flex items-center justify-between gap-4 py-3">
          <div>
            <p className="font-medium text-ink-900">{sponsor.name}</p>
            {sponsor.website_url && (
              <a href={sponsor.website_url} target="_blank" className="text-xs text-ink-900/50 underline">
                {sponsor.website_url}
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge>{sponsor.tier}</Badge>
            <Button
              variant="danger"
              className="px-3 py-1 text-xs"
              disabled={isPending}
              onClick={() => {
                if (confirm(`Remove sponsor "${sponsor.name}"?`)) {
                  startTransition(() => deleteSponsorAction(sponsor.id, sponsor.name));
                }
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
