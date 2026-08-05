"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";

type UpgradeState = "idle" | "busy" | "error";

export default function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, profile, login, signup, logout, refresh } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [upgrade, setUpgrade] = useState<UpgradeState>("idle");
  const ref = useRef<HTMLDivElement>(null);

  async function checkout(plan: "starter" | "pro") {
    setUpgrade("busy");
    setError("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed.");

      // Load Razorpay checkout script, then open the payment modal.
      await new Promise<void>((resolve, reject) => {
        if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve();
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Couldn't load payment checkout."));
        document.head.appendChild(s);
      });

      const R = (window as unknown as {
        Razorpay: new (opts: Record<string, unknown>) => { open: () => void };
      }).Razorpay;

      const payment = new R({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Hook AI",
        description: data.label,
        theme: { color: "#6366f1" },
        order_id: data.orderId,
        prefill: { email: user?.email || "" },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          const verify = await fetch("/api/billing/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              plan,
            }),
          });
          const vdata = await verify.json();
          if (!verify.ok) throw new Error(vdata.error || "Verification failed.");
          setUpgrade("idle");
          setError("");
          await refresh();
        },
        modal: { ondismiss: () => setUpgrade("idle") },
      });
      payment.open();
    } catch (err) {
      setUpgrade("error");
      setError(err instanceof Error ? err.message : "Checkout failed.");
    }
  }

  useEffect(() => {
    if (open) {
      setError("");
      if (user) setMode("login");
    }
  }, [open, user]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        className="card-elevated w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">
            {user ? "Your account" : mode === "signup" ? "Create your account" : "Welcome back"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {user ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl bg-zinc-50 p-4 text-sm dark:bg-zinc-800/50">
              <p className="font-medium">{user.email}</p>
              <p className="mt-1 text-zinc-500">
                Free credits remaining: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{profile?.credits ?? 0}</span>
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Top up credits</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => checkout("starter")}
                  disabled={upgrade === "busy"}
                  className="rounded-xl border border-zinc-300 p-3 text-left transition hover:border-indigo-400 dark:border-zinc-700"
                >
                  <p className="text-lg font-bold">50</p>
                  <p className="text-xs text-zinc-500">credits · Starter</p>
                </button>
                <button
                  onClick={() => checkout("pro")}
                  disabled={upgrade === "busy"}
                  className="bg-gradient-brand rounded-xl p-3 text-left text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
                >
                  <p className="text-lg font-bold">250</p>
                  <p className="text-xs text-white/80">credits · Pro</p>
                </button>
              </div>
              {upgrade === "busy" && <p className="mt-2 text-xs text-zinc-500">Opening secure checkout…</p>}
              {upgrade === "error" && <p className="mt-2 text-xs text-amber-600">{error}</p>}
            </div>

            <button
              onClick={async () => { await logout(); onClose(); }}
              className="w-full rounded-xl border border-zinc-300 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            {mode === "signup" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-indigo-900/40"
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-indigo-900/40"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (8+ characters)"
              required
              minLength={8}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-indigo-900/40"
            />
            {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="bg-gradient-brand w-full rounded-xl py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signup" ? "Create account · 10 free credits" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              className="w-full text-center text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
