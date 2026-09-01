"use client";

import { useState, useTransition } from "react";
import { updateEventAction, deleteEventAction } from "./actions";
import type { FestEvent } from "@/lib/types";
import { Field, TextAreaField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventRow({ event }: { event: FestEvent }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-4 py-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-ink-900">{event.title}</p>
            {!event.is_published && <Badge tone="warning">Draft</Badge>}
          </div>
          <p className="mt-1 text-sm text-ink-900/60">{event.description}</p>
          <p className="mt-1 text-xs text-ink-900/40">
            {new Date(event.start_time).toLocaleString()} {event.venue ? `· ${event.venue}` : ""} · {event.category}
          </p>
        </div>
        <div className="flex flex-none gap-2">
          <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button
            variant="danger"
            className="px-3 py-1 text-xs"
            disabled={isPending}
            onClick={() => {
              if (confirm(`Delete "${event.title}"? This can't be undone.`)) {
                startTransition(() => deleteEventAction(event.id, event.title));
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          await updateEventAction(event.id, formData);
          setEditing(false);
        })
      }
      className="space-y-3 border-b border-ink-900/10 py-4"
    >
      <Field label="Title" name="title" defaultValue={event.title} required />
      <TextAreaField label="Description" name="description" defaultValue={event.description} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category" name="category" defaultValue={event.category} />
        <Field label="Venue" name="venue" defaultValue={event.venue ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Starts" name="start_time" type="datetime-local" defaultValue={toLocalInputValue(event.start_time)} required />
        <Field label="Ends" name="end_time" type="datetime-local" defaultValue={toLocalInputValue(event.end_time)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-900/70">
        <input type="checkbox" name="is_published" defaultChecked={event.is_published} />
        Published on the public site
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save changes"}</Button>
        <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    </form>
  );
}
