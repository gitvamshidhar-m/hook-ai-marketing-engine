"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/tracking";

const FLAG = "hookai-exit-intent-seen";
const DELAY_MS = 14000;

export default function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const armed = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(FLAG)) return;
    } catch {
      return;
    }
    const fire = () => {
      if (armed.current) return;
      armed.current = true;
      try {
        localStorage.setItem(FLAG, "1");
      } catch {
        /* ignore */
      }
      setOpen(true);
      track("exit_intent_shown");
    };
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 40) fire();
    };
    const timeout = setTimeout(fire, DELAY_MS);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("mouseleave", onLeave);
      clearTimeout(timeout);
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setMessage("Enter a valid email.");
      setState("error");
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/captures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), topic: "free hook pack" }),
      });
      if (!res.ok) throw new Error("failed");
      setState("done");
      setMessage("Check your inbox — your hook pack is on the way.");
    } catch {
      setState("error");
      setMessage("Couldn't save your email — please try again.");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="card-elevated relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-4 top-4 text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          ✕
        </button>

        {state === "done" ? (
          <div className="py-6 text-center">
            <span className="bg-gradient-brand mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl text-white">⚡</span>
            <h2 className="mt-4 text-lg font-bold">You&apos;re in.</h2>
            <p className="mt-1 text-sm text-zinc-500">{message}</p>
          </div>
        ) : (
          <>
            <span className="bg-gradient-brand inline-flex rounded-full px-3 py-1 text-xs font-bold text-white">
              Free hook pack
            </span>
            <h2 className="mt-3 text-lg font-bold">Wait — grab your free Hook Pack before you go</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Every marketer needs a swipe file. We&apos;ll send you a weekly bank of winning angles, plus a
              head-start on your next campaign. No spam.
            </p>
            <form onSubmit={submit} className="mt-4 flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
              />
              <button
                type="submit"
                disabled={state === "sending"}
                className="bg-gradient-brand w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
              >
                {state === "sending" ? "Sending…" : "Send me the Hook Pack"}
              </button>
              {state === "error" && <p className="text-xs text-rose-600">{message}</p>}
            </form>
            <button
              onClick={() => setOpen(false)}
              className="mt-2 w-full text-center text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              No thanks, I&apos;ll generate my own
            </button>
          </>
        )}
      </div>
    </div>
  );
}
