"use client";

import { clsx } from "clsx";
import { useFormStatus } from "react-dom";

export function Button({
  children,
  variant = "primary",
  className,
  type = "button",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  return (
    <button
      type={type}
      className={clsx(
        "focus-ring inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-ink-900 text-paper hover:bg-ink-800",
        variant === "secondary" && "border border-ink-900/15 text-ink-900 hover:bg-ink-900/5",
        variant === "danger" && "bg-magenta-500 text-paper hover:bg-magenta-600",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Submit button that shows a pending state — for use inside a <form action={...}>. */
export function SubmitButton({ children, pendingLabel }: { children: React.ReactNode; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? pendingLabel : children}
    </Button>
  );
}
