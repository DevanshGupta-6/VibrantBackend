import { createServiceRoleClient } from "./supabase/server";

interface RateLimitConfig {
  windowSeconds: number;
  maxAttempts: number;
}

// Per the sequence diagram's login/register entry points: keep these
// generous enough for a genuine user who mistypes a password, tight enough
// to stop credential stuffing / registration spam.
export const RATE_LIMITS: Record<"login" | "register", RateLimitConfig> = {
  login: { windowSeconds: 15 * 60, maxAttempts: 8 },
  register: { windowSeconds: 60 * 60, maxAttempts: 4 }
};

/**
 * Sliding-window check backed by the auth_rate_limit table. Call BEFORE
 * attempting the Supabase auth call. Records the attempt regardless of
 * whether it ultimately succeeds, so repeated failed logins still count
 * against the window (only a successful login should be "free", but we
 * keep this deliberately simple/strict for a fest-scale admin dashboard).
 */
export async function checkRateLimit(
  identifier: string,
  action: "login" | "register"
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const supabase = createServiceRoleClient();
  const { windowSeconds, maxAttempts } = RATE_LIMITS[action];
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const { count, error } = await supabase
    .from("auth_rate_limit")
    .select("id", { count: "exact", head: true })
    .eq("identifier", identifier.toLowerCase())
    .eq("action", action)
    .gte("attempted_at", windowStart);

  if (error) {
    // Fail open on infra errors — don't lock users out because logging broke —
    // but log loudly so it gets noticed.
    console.error("Rate limit check failed:", error.message);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if ((count ?? 0) >= maxAttempts) {
    return { allowed: false, retryAfterSeconds: windowSeconds };
  }

  await supabase
    .from("auth_rate_limit")
    .insert({ identifier: identifier.toLowerCase(), action });

  return { allowed: true, retryAfterSeconds: 0 };
}
