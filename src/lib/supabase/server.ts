import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Server Component / Server Action client — reads the session from cookies
 * and is subject to RLS as the signed-in user. This is what "Server
 * Component/Action" talks to NextAuth-equivalent session state through in
 * the architecture diagram; here Supabase Auth plays that role directly.
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component render — safe to ignore since
            // middleware refreshes the session cookie on every request.
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // See note above.
          }
        }
      }
    }
  );
}

/**
 * Service-role client — bypasses RLS entirely. Server-only (the key is
 * never sent to the browser). Reserved for: rate limiting, activity
 * logging, and provisioning the very first admin_profiles row where RLS
 * would otherwise create a chicken-and-egg problem.
 */
export function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
