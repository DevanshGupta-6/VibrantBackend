"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "../actions";
import { Field } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, { error: undefined as string | undefined });
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") ?? "/admin";

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-900 px-6">
      <div className="w-full max-w-sm rounded-lg bg-paper p-8">
        <p className="font-display text-xl text-ink-900">Zenith Fest Admin</p>
        <p className="mt-1 text-sm text-ink-900/60">Sign in to manage the dashboard.</p>

        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Field label="Email" name="email" type="email" required />
          <Field label="Password" name="password" type="password" required />
          <FormError message={state?.error} />
          <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-ink-900/60">
          Need access?{" "}
          <Link href="/register" className="font-medium text-ink-900 underline">
            Request an admin account
          </Link>
        </p>
      </div>
    </main>
  );
}
