"use client";

import { useRef, useTransition } from "react";
import { createEventAction } from "./actions";
import { Field, TextAreaField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function NewEventForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) =>
        startTransition(async () => {
          await createEventAction(formData);
          formRef.current?.reset();
        })
      }
      className="space-y-3"
    >
      <Field label="Title" name="title" required />
      <TextAreaField label="Description" name="description" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category" name="category" placeholder="Music, Tech, Art…" />
        <Field label="Venue" name="venue" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Starts" name="start_time" type="datetime-local" required />
        <Field label="Ends" name="end_time" type="datetime-local" />
      </div>
      <Button type="submit" disabled={isPending}>{isPending ? "Adding…" : "Add event"}</Button>
    </form>
  );
}
