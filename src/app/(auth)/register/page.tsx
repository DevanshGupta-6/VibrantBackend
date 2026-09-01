"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { registerAction } from "../actions";
import { Field } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerAction, { error: undefined as string | undefined });

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-900 px-6">
      <div className="w-full max-w-sm rounded-lg bg-paper p-8">
        <p className="font-display text-xl text-ink-900">Request admin access</p>
        <p className="mt-1 text-sm text-ink-900/60">
          A super admin will assign your role before you can sign in.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <Field label="Full name" name="fullName" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Password" name="password" type="password" required placeholder="At least 8 characters" />
          <FormError message={state?.error} />
          <SubmitButton pendingLabel="Creating account…">Request access</SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-ink-900/60">
          Already have access?{" "}
          <Link href="/login" className="font-medium text-ink-900 underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
