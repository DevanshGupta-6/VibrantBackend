"use client";

import { useState, useTransition } from "react";
import { updateFaqAction, deleteFaqAction } from "./actions";
import type { Faq } from "@/lib/types";
import { Field, TextAreaField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function FaqRow({ faq }: { faq: Faq }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-4 py-4">
        <div>
          <p className="font-medium text-ink-900">{faq.question}</p>
          <p className="mt-1 text-sm text-ink-900/60">{faq.answer}</p>
        </div>
        <div className="flex flex-none gap-2">
          <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => setEditing(true)}>Edit</Button>
          <Button
            variant="danger"
            className="px-3 py-1 text-xs"
            disabled={isPending}
            onClick={() => {
              if (confirm("Delete this FAQ?")) {
                startTransition(() => deleteFaqAction(faq.id, faq.question));
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
          await updateFaqAction(faq.id, formData);
          setEditing(false);
        })
      }
      className="space-y-3 border-b border-ink-900/10 py-4"
    >
      <Field label="Question" name="question" defaultValue={faq.question} required />
      <TextAreaField label="Answer" name="answer" defaultValue={faq.answer} required />
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save"}</Button>
        <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    </form>
  );
}
