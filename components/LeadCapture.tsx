"use client";

import { useState } from "react";
import { track } from "@/lib/tracking";

export default function LeadCapture({
  title = "Get the full campaign plan in your inbox",
  subtitle = "Tell us what you're working on — we'll send a sample hook breakdown you can steal.",
  source = "site",
  compact = false,
}: {
  title?: string;
  subtitle?: string;
  source?: string;
  compact?: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("Enter a valid email.");
      setState("error");
      return;
    }
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/leads/general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      track("lead_captured", { source });
      setState("done");
    } catch {
      setState("error");
      setError("Could not save your lead — please try again.");
    }
  }

  if (state === "done") {
    return (
      <div className={`card-elevated flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/40 ${compact ? "" : "mt-8"}`}>
<p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          Thanks! We have your details — we will send your free breakdown shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={`card-elevated rounded-2xl border border-indigo-200 bg-indigo-50/60 p-6 dark:border-indigo-900 dark:bg-indigo-950/30 ${compact ? "" : "mt-8"}`}
    >
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          type="email"
          required
          className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="bg-gradient-brand rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : "Send my breakdown"}
        </button>
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What are you marketing right now? (optional)"
        className="mt-3 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
      />
      {state === "error" && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </form>
  );
}