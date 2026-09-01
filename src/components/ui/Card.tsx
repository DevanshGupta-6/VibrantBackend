import { clsx } from "clsx";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-lg border border-ink-900/10 bg-white p-6", className)}>
      {children}
    </div>
  );
}
