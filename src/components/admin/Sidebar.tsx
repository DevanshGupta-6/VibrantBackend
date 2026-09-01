"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { NAV_ITEMS, can } from "@/lib/rbac";
import type { AdminProfile } from "@/lib/types";
import { signOutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";

export function Sidebar({ profile }: { profile: AdminProfile }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => can(profile, item.permission));

  return (
    <aside className="flex h-screen w-60 flex-none flex-col justify-between bg-ink-900 text-paper">
      <div>
        <div className="px-5 py-6">
          <p className="font-display text-lg">Zenith Fest</p>
          <p className="text-xs text-paper/50">Admin dashboard</p>
        </div>
        <nav className="flex flex-col gap-0.5 px-3">
          {items.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "focus-ring rounded-md px-3 py-2 text-sm transition-colors",
                  active ? "bg-paper/10 text-paper" : "text-paper/60 hover:bg-paper/5 hover:text-paper"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-paper/10 px-5 py-4">
        <p className="truncate text-sm">{profile.full_name}</p>
        <p className="truncate text-xs text-paper/50">{profile.role?.replace("_", " ")}</p>
        <form action={signOutAction} className="mt-3">
          <Button type="submit" variant="secondary" className="w-full border-paper/20 text-paper hover:bg-paper/10">
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  );
}
