// app/admin/SessionGuard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Mounts invisibly in the admin layout and signs the user out automatically
// when the tab/window is closed or navigated away from.
//
// Uses two complementary events:
//   • "visibilitychange" (hidden) — fires reliably when the tab loses focus
//     or the window is minimised / closed in most browsers.
//   • "pagehide" — fires on mobile Safari & during bfcache navigation.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function SessionGuard() {
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleHide = () => {
      // document.hidden is true when the tab is being closed or switched away.
      if (document.hidden) {
        // signOut() is async but we fire-and-forget here because the page is
        // unloading — we can't await in a synchronous event handler.
        supabase.auth.signOut();
      }
    };

    const handlePageHide = () => {
      supabase.auth.signOut();
    };

    document.addEventListener("visibilitychange", handleHide);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleHide);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  // Renders nothing — purely behavioural.
  return null;
}
