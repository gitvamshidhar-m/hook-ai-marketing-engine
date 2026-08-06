"use client";

import { useState } from "react";
import { grantEmailBonus } from "@/lib/tracking";

export default function EmailCapture({ topic, onClaimed }: { topic: string; onClaimed: (bonus: number) => void }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setMessage("Enter a valid email to claim the bonus.");
      setState("error");
      return;
    }
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/captures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), topic }),
      });
      if (!res.ok) throw new Error("failed");
      const bonus = grantEmailBonus();
      setState("done");
      setMessage(`+${bonus} bonus runs unlocked today.`);
      onClaimed(bonus);
    } catch {
      setState("error");
      setMessage("Couldn't save your email — please try again.");
    }
  }

  if (state === "done") {
    return (
      <div className="card-elevated mt-6 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{message}</p>
        <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">Unlocked</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="card-elevated mt-6 flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900 dark:bg-indigo-950/30 sm:flex-row sm:items-center"
    >
      <div className="flex-1">
        <p className="text-sm font-semibold">Love these hooks? Unlock 5 more free runs today.</p>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">Drop your email and we send the angles you have not seen yet. No spam.</p>
      </div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 sm:w-64"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="bg-gradient-brand rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
      >
        {state === "sending" ? "Unlocking…" : "Unlock +5"}
      </button>
      {state === "error" && <p className="text-xs text-rose-600">{message}</p>}
    </form>
  );
}