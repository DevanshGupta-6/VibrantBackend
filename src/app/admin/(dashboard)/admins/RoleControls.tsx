"use client";

import { useTransition } from "react";
import { setAdminRoleAction, setAdminStatusAction } from "./actions";
import type { AdminProfile, AdminRole, AdminStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export function RoleControls({ admin, isSelf }: { admin: AdminProfile; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();

  function setRole(role: AdminRole) {
    startTransition(() => setAdminRoleAction(admin.id, role));
  }

  function setStatus(status: AdminStatus) {
    startTransition(() => setAdminStatusAction(admin.id, status));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        defaultValue={admin.role ?? ""}
        disabled={isPending}
        onChange={(e) => setRole(e.target.value as AdminRole)}
        className="focus-ring rounded-md border border-ink-900/15 bg-white px-2 py-1 text-xs"
      >
        <option value="" disabled>
          Assign role…
        </option>
        <option value="SUPER_ADMIN">Super admin</option>
        <option value="COORDINATOR">Coordinator</option>
      </select>

      {admin.status === "suspended" ? (
        <Button variant="secondary" className="px-2 py-1 text-xs" disabled={isPending} onClick={() => setStatus("active")}>
          Reinstate
        </Button>
      ) : (
        <Button
          variant="danger"
          className="px-2 py-1 text-xs"
          disabled={isPending || isSelf}
          onClick={() => setStatus("suspended")}
        >
          Suspend
        </Button>
      )}
    </div>
  );
}
