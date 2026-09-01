import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Faq } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Field, TextAreaField } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/Button";
import { addFaqAction } from "./actions";
import { FaqRow } from "./FaqRow";

export default async function FaqsPage() {
  const supabase = createServerSupabaseClient();
  const { data: faqs } = await supabase.from("faqs").select("*").order("display_order", { ascending: true });

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">FAQs</h1>
      <p className="mt-1 text-sm text-ink-900/60">Shown on the public home page, in this order.</p>

      <Card className="mt-6">
        <h2 className="font-display text-lg text-ink-900">Add an FAQ</h2>
        <form action={addFaqAction} className="mt-4 space-y-3">
          <Field label="Question" name="question" required />
          <TextAreaField label="Answer" name="answer" required />
          <SubmitButton pendingLabel="Adding…">Add FAQ</SubmitButton>
        </form>
      </Card>

      <div className="mt-6 divide-y divide-ink-900/10 rounded-lg border border-ink-900/10 bg-white px-5">
        {faqs && faqs.length > 0 ? (
          (faqs as Faq[]).map((faq) => <FaqRow key={faq.id} faq={faq} />)
        ) : (
          <p className="py-6 text-sm text-ink-900/50">No FAQs yet — add the first one above.</p>
        )}
      </div>
    </div>
  );
}
