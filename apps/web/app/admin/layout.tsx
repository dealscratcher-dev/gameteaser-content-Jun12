// app/admin/layout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Server-side auth guard for all /admin/* routes.
// Runs before any admin page renders — no user = redirect to /admin/login.
// The login page itself is excluded to avoid an infinite redirect loop.
// ─────────────────────────────────────────────────────────────────────────────

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the current pathname from the custom header set by middleware.
  // Falls back to checking the Next.js internal header if x-pathname isn't set.
  const headersList = await headers();
  const pathname =
    headersList.get("x-pathname") ??
    headersList.get("x-invoke-path") ??
    "";

  // Always treat /admin/login as the login page, even with an empty pathname,
  // by also checking the Next.js route header as a safety net.
  const nextUrl = headersList.get("x-nextjs-page") ?? "";
  const isLoginPage =
    pathname.startsWith("/admin/login") ||
    nextUrl.includes("admin/login");

  // Skip auth check for the login page to prevent redirect loops
  if (!isLoginPage) {
    const supabase = await createServerSupabaseClient();

    // Use getUser() — unlike getSession(), this verifies the token server-side.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // No authenticated user → bounce to login
    if (!user) {
      redirect("/admin/login");
    }
  }

  return <>{children}</>;
}
