import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Root middleware — this is the "Next.js Middleware" lane in the sequence
 * diagram. Every request to /admin/* passes through "Check Session & Role"
 * here before it ever reaches a Server Component or Action.
 *
 *   No session            -> redirect /admin/login
 *   Session, no/​pending role -> redirect /admin/pending
 *   Valid session + role   -> allow, request proceeds to the Server Component
 */
export async function middleware(request: NextRequest) {
  const { response, supabase, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isPendingPage = pathname === "/admin/pending";

  if (!isAdminRoute) return response;

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  const isActiveWithRole = !!profile && profile.status === "active" && profile.role !== null;

  if (!isActiveWithRole && !isPendingPage) {
    return NextResponse.redirect(new URL("/admin/pending", request.url));
  }

  if (isActiveWithRole && isPendingPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Route-level role gate for SUPER_ADMIN-only sections.
  const superAdminOnly = pathname.startsWith("/admin/admins") || pathname.startsWith("/admin/sponsors");
  if (superAdminOnly && profile?.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/admin?error=forbidden", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"]
};
