# Zenith Fest — Admin Dashboard

Next.js 14 (App Router, TypeScript) + Supabase (Postgres, Auth, Storage).
Mirrors the flow in the architecture diagram this was built from: Next.js
Middleware checks session & role before anything renders, Server
Components/Actions talk to Supabase (standing in for the Prisma/NextAuth
lanes), and mutations call `revalidatePath` to invalidate the public
site's cache.

## What's included

- **Login / Register**, both rate-limited (sliding window, stored in
  Postgres — see `src/lib/rateLimit.ts`).
- **RBAC** with two roles, `SUPER_ADMIN` and `COORDINATOR`, defined in one
  place: `src/lib/rbac.ts`. New registrations sit as `pending` with no
  role until a super admin assigns one.
- **Admin management** (`/admin/admins`, super admin only) — assign
  roles, suspend/reinstate admins.
- **Events** (`/admin/events`, either role) — create, edit, delete;
  published events show on the public home page.
- **Sponsors** (`/admin/sponsors`, super admin only) — add/remove.
- **Gallery** (`/admin/gallery`, either role) — upload/delete photos via
  Supabase Storage; public at `/gallery`.
- **FAQs** (`/admin/faqs`, either role) — add/edit/delete; shown on the
  public home page.
- **Dashboard overview** (`/admin`) — counts of events/photos/sponsors
  plus a Recent Activity feed (`activity_log` table, written on every
  mutation).
- Every mutation is double-gated: `middleware.ts` blocks the route, and
  each server action independently re-checks the caller's role before
  touching the database (defense in depth, same as "Verify Role" before
  the Prisma write in the diagram).

## Setup

1. **Create a Supabase project** at supabase.com.
2. **Run the schema** — open the SQL editor and paste in
   `supabase/schema.sql`. This creates all tables, RLS policies, the
   `fest-media` storage bucket, and its policies.
3. **Copy `.env.local.example` to `.env.local`** and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project
     Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY` — same page. **Never** expose this to the
     client; it's only used server-side for rate limiting and activity
     logging.
   - `INITIAL_SUPER_ADMIN_EMAILS` — your own email, comma-separated if
     more than one. Whoever registers with a matching email is
     auto-approved as `SUPER_ADMIN` so you're not locked out of an empty
     dashboard. Everyone else lands on "Waiting on approval" until you
     assign them a role from `/admin/admins`.
4. In Supabase Auth settings, you can leave "Confirm email" on (default)
   or turn it off for faster local testing — if it's on, users must
   confirm their email before they can sign in.
5. Install and run:
   ```bash
   npm install
   npm run dev
   ```
6. Visit `/register`, sign up with your bootstrap email, and you'll land
   straight in `/admin`. Anyone else who registers after that shows up
   under "Awaiting approval" on the Admin users page.

## Notes on the rate limiting

`checkRateLimit` in `src/lib/rateLimit.ts` counts attempts per
`email|IP` in a Postgres table (`auth_rate_limit`) over a sliding
window — 8 login attempts / 15 minutes, 4 registrations / hour by
default. It fails open on infra errors (logs the error rather than
locking everyone out) — tighten that behavior if this ever handles
something more sensitive than fest sign-ups.

## Extending roles

Everything permission-related routes through `PERMISSIONS` in
`src/lib/rbac.ts`. To add a third role, add it to the `admin_role`
Postgres enum, add it to `AdminRole` in `src/lib/types.ts`, and add it to
whichever `PERMISSIONS` arrays it should belong to — the sidebar nav and
every server action's permission check pick it up automatically.

## Project structure

```
src/
  app/
    page.tsx                    public home (events + FAQs)
    gallery/page.tsx             public gallery
    (auth)/login, register       auth pages + actions.ts (rate-limited)
    admin/
      actions.ts                 sign-out
      pending/page.tsx           "waiting for approval" screen
      (dashboard)/
        layout.tsx                sidebar shell, re-checks session+role
        page.tsx                  overview: stats + recent activity
        admins/                   super admin: assign roles, suspend
        events/                   coordinator: CRUD
        sponsors/                 super admin: add/remove
        gallery/                  coordinator: upload/delete (Storage)
        faqs/                     coordinator: CRUD
  components/
    ui/                          Button, Field, Card, Badge, FormError
    admin/                       Sidebar, StatsCard, ActivityFeed
  lib/
    supabase/                    browser / server / service-role clients
    rbac.ts                      permission matrix
    rateLimit.ts                 login/register rate limiting
    activityLog.ts               writes to activity_log
    types.ts
middleware.ts                    session + role gate for /admin/*
supabase/schema.sql               tables, RLS, storage bucket
```
