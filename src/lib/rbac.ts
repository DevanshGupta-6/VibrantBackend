import type { AdminProfile, AdminRole } from "./types";

/**
 * Central permission matrix. Keep every access decision behind these
 * helpers rather than sprinkling `role === "SUPER_ADMIN"` checks around —
 * the middleware and server actions both call into this file so the rules
 * only live in one place.
 */
export const PERMISSIONS = {
  MANAGE_ADMINS: ["SUPER_ADMIN"] as AdminRole[],
  MANAGE_SPONSORS: ["SUPER_ADMIN"] as AdminRole[],
  MANAGE_EVENTS: ["SUPER_ADMIN", "COORDINATOR"] as AdminRole[],
  MANAGE_GALLERY: ["SUPER_ADMIN", "COORDINATOR"] as AdminRole[],
  MANAGE_FAQS: ["SUPER_ADMIN", "COORDINATOR"] as AdminRole[],
  VIEW_DASHBOARD: ["SUPER_ADMIN", "COORDINATOR"] as AdminRole[]
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function isActiveAdmin(profile: AdminProfile | null): boolean {
  return !!profile && profile.status === "active" && profile.role !== null;
}

export function can(profile: AdminProfile | null, permission: Permission): boolean {
  if (!isActiveAdmin(profile) || !profile?.role) return false;
  return (PERMISSIONS[permission] as readonly AdminRole[]).includes(profile.role);
}

/** Nav items shown in the admin sidebar, filtered by role. */
export const NAV_ITEMS: { href: string; label: string; permission: Permission }[] = [
  { href: "/admin", label: "Overview", permission: "VIEW_DASHBOARD" },
  { href: "/admin/events", label: "Events", permission: "MANAGE_EVENTS" },
  { href: "/admin/gallery", label: "Gallery", permission: "MANAGE_GALLERY" },
  { href: "/admin/faqs", label: "FAQs", permission: "MANAGE_FAQS" },
  { href: "/admin/sponsors", label: "Sponsors", permission: "MANAGE_SPONSORS" },
  { href: "/admin/admins", label: "Admin users", permission: "MANAGE_ADMINS" }
];
