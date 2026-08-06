"use client";

import { useState } from "react";

export default function LeadForm({ slug, topic }: { slug: string; topic: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareSlug: slug, name, email, company }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
        <p className="font-semibold text-emerald-700 dark:text-emerald-300">Thanks! We&apos;ll get back to you soon.</p>
        <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80">
          Your request about “{topic}” has been received.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-indigo-900/40";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-gradient-soft p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-semibold">Want the full plan for this campaign?</h3>
      <p className="mt-1 text-sm text-zinc-500">
        Leave your email and we&apos;ll send you the complete strategy, budget split, and calendar.
      </p>
      <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={80} className={inputClass} />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          type="email"
          required
          maxLength={200}
          className={inputClass}
        />
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company (optional)"
          maxLength={120}
          className={`${inputClass} sm:col-span-2`}
        />
        {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="bg-gradient-brand rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60 sm:col-span-2"
        >
          {busy ? "Sending…" : "Send me the full plan"}
        </button>
      </form>
    </div>
  );
}
