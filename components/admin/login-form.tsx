"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";

const initialState: { error?: string } = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="info-card mx-auto max-w-md space-y-4">
      <h1 className="font-[family-name:var(--font-serif)] text-3xl">Admin login</h1>
      <div>
        <label className="mb-1 block text-sm font-medium">Username</label>
        <input name="username" className="w-full rounded-xl border border-[#d4c2a2] px-3 py-2" required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Password</label>
        <input name="password" type="password" className="w-full rounded-xl border border-[#d4c2a2] px-3 py-2" required />
      </div>
      {state.error ? <p className="text-sm text-rose-700">{state.error}</p> : null}
      <button disabled={pending} className="w-full rounded-full bg-[#a68149] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}


