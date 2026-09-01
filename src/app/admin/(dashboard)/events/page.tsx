import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { FestEvent } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { EventRow } from "./EventRow";
import { NewEventForm } from "./NewEventForm";

export default async function EventsPage() {
  const supabase = createServerSupabaseClient();
  const { data: events } = await supabase.from("events").select("*").order("start_time", { ascending: true });

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Events</h1>
      <p className="mt-1 text-sm text-ink-900/60">Create, edit, and remove events on the fest schedule.</p>

      <Card className="mt-6">
        <h2 className="font-display text-lg text-ink-900">Add an event</h2>
        <div className="mt-4">
          <NewEventForm />
        </div>
      </Card>

      <div className="mt-6 divide-y divide-ink-900/10 rounded-lg border border-ink-900/10 bg-white px-5">
        {events && events.length > 0 ? (
          (events as FestEvent[]).map((event) => <EventRow key={event.id} event={event} />)
        ) : (
          <p className="py-6 text-sm text-ink-900/50">No events yet — add the first one above.</p>
        )}
      </div>
    </div>
  );
}
