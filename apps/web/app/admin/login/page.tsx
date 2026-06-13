// app/admin/login/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Public route — NOT inside the auth-guarded layout.
// Redirects to /admin/review if a session already exists.
// ─────────────────────────────────────────────────────────────────────────────

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage() {
  // Already logged in? Skip straight to the dashboard.
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser(); // server-verified — cannot be bypassed by a stale cookie

  if (user) {
    redirect("/admin/review");
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="text-4xl" role="img" aria-label="shield">🛡️</span>
          <h1 className="mt-4 font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-white">
            Admin Access
          </h1>
          <p className="mt-1 text-sm text-white/40">
            TheGameBit Content Dashboard
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
