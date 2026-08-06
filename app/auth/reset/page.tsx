"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const params = useSearchParams();
  const code = params.get("code") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!code) {
    return (
      <p className="text-sm text-zinc-500">
        This link is missing a reset code. Use the link from the password-reset email, or{" "}
        <Link href="/" className="text-indigo-600 hover:underline dark:text-indigo-400">
          go back home
        </Link>
        .
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update password.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">Password updated</p>
        <p className="mt-1 text-sm text-zinc-500">You can now sign in with your new password.</p>
        <Link
          href="/"
          className="bg-gradient-brand mt-6 inline-block rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
        >
          Go to Hook AI
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">New password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          placeholder="8+ characters"
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-indigo-900/40"
        />
      </label>
      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        placeholder="Confirm password"
        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-indigo-900/40"
      />
      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="bg-gradient-brand w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
      >
        {busy ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-md px-4 py-16">
        <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-xl font-bold tracking-tight">Set a new password</h1>
          <p className="mt-1 text-sm text-zinc-500">Choose a strong password for your Hook AI account.</p>
          <div className="mt-5">
            <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
              <ResetForm />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}