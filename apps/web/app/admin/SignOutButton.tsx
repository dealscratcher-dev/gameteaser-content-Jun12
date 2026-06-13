// app/admin/SignOutButton.tsx
// Drop this anywhere inside the admin header — it calls the server action.
"use client";

import { signOut } from "./login/actions";

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-xs font-bold uppercase tracking-wider text-white/30 hover:text-white/60 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded transition"
      >
        Sign out
      </button>
    </form>
  );
}
