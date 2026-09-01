import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { FestEvent, Faq } from "@/lib/types";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createServerSupabaseClient();

  const [{ data: events }, { data: faqs }] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .order("start_time", { ascending: true })
      .limit(6),
    supabase.from("faqs").select("*").order("display_order", { ascending: true })
  ]);

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-ink-900/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="font-display text-lg font-medium tracking-tight text-ink-900">
            Zenith Fest
          </span>
          <nav className="flex items-center gap-6 text-sm text-ink-900/70">
            <Link href="/gallery" className="hover:text-ink-900">Gallery</Link>
            <Link href="/login" className="hover:text-ink-900">Admin</Link>
          </nav>
        </div>
      </header>

      <section className="bg-ink-900 py-20 text-paper">
        <div className="mx-auto max-w-5xl px-6">
          <p className="font-display text-5xl leading-[1.05] md:text-6xl">
            Three days. One campus.
            <br />
            <span className="text-marigold-500">Every stage lit at once.</span>
          </p>
          <p className="mt-6 max-w-md text-paper/70">
            Zenith Fest brings music, tech, and art onto the same weekend.
            Here&rsquo;s what&rsquo;s on, where to find it, and who made it happen.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-display text-2xl text-ink-900">Coming up</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {events && events.length > 0 ? (
            (events as FestEvent[]).map((event) => (
              <div key={event.id} className="rounded-lg border border-ink-900/10 p-5">
                <p className="text-xs uppercase tracking-wide text-magenta-500">{event.category}</p>
                <h3 className="mt-1 font-display text-lg text-ink-900">{event.title}</h3>
                <p className="mt-2 text-sm text-ink-900/70">{event.description}</p>
                <p className="mt-3 text-xs text-ink-900/50">
                  {new Date(event.start_time).toLocaleString()}
                  {event.venue ? ` · ${event.venue}` : ""}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-900/50">Schedule is being finalized — check back soon.</p>
          )}
        </div>
      </section>

      {faqs && faqs.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-display text-2xl text-ink-900">Questions people ask</h2>
          <div className="mt-6 divide-y divide-ink-900/10">
            {(faqs as Faq[]).map((faq) => (
              <details key={faq.id} className="group py-4">
                <summary className="cursor-pointer list-none font-medium text-ink-900">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm text-ink-900/70">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-ink-900/10 px-6 py-8 text-center text-xs text-ink-900/40">
        Zenith Fest · Built with Next.js and Supabase
      </footer>
    </main>
  );
}
