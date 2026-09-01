import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Sponsor } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Field, SelectField } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/Button";
import { addSponsorAction } from "./actions";
import { SponsorList } from "./SponsorList";

export default async function SponsorsPage() {
  const supabase = createServerSupabaseClient();
  const { data: sponsors } = await supabase.from("sponsors").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Sponsors</h1>
      <p className="mt-1 text-sm text-ink-900/60">Super admin only — add or remove fest sponsors.</p>

      <Card className="mt-6">
        <h2 className="font-display text-lg text-ink-900">Add a sponsor</h2>
        <form action={addSponsorAction} className="mt-4 space-y-3">
          <Field label="Sponsor name" name="name" required />
          <SelectField
            label="Tier"
            name="tier"
            defaultValue="Silver"
            options={[
              { value: "Title", label: "Title" },
              { value: "Gold", label: "Gold" },
              { value: "Silver", label: "Silver" },
              { value: "Bronze", label: "Bronze" },
              { value: "Partner", label: "Partner" }
            ]}
          />
          <Field label="Website" name="website_url" placeholder="https://…" />
          <Field label="Logo URL" name="logo_url" placeholder="https://…" />
          <SubmitButton pendingLabel="Adding…">Add sponsor</SubmitButton>
        </form>
      </Card>

      <div className="mt-6 rounded-lg border border-ink-900/10 bg-white px-5">
        <SponsorList sponsors={(sponsors ?? []) as Sponsor[]} />
      </div>
    </div>
  );
}
