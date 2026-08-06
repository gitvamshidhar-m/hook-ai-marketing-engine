"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

type Referral = { code: string; url: string; referredCount: number; creditsEarned: number };

type UpgradeState = "idle" | "busy" | "error";

export default function AccountPage() {
  const { user, profile, logout } = useAuth();
  const [referral, setReferral] = useState<Referral | null>(null);
  const [refCopied, setRefCopied] = useState(false);
  const [upgrade, setUpgrade] = useState<UpgradeState>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetch("/api/referral")
      .then((r) => r.json())
      .then((d) => {
        if (active && d && d.code) setReferral(d);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user]);

  async function copyRef() {
    if (!referral) return;
    try {
      await navigator.clipboard.writeText(referral.url);
      setRefCopied(true);
      setTimeout(() => setRefCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

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
          window.location.reload();
        },
        modal: { ondismiss: () => setUpgrade("idle") },
      });
      payment.open();
    } catch (err) {
      setUpgrade("error");
      setError(err instanceof Error ? err.message : "Checkout failed.");
    }
  }

  if (!user) {
    return (
      <main className="flex-1">
        <div className="mx-auto w-full max-w-md px-4 py-24 text-center">
          <p className="text-xl font-semibold">Sign in to view your account.</p>
          <p className="mt-2 text-sm text-zinc-500">
            Credits, referral links, and top-ups live here.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage your credits, referral link, and sign-out.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Signed in as</p>
            <p className="mt-1 break-all font-medium">{user.email}</p>
            <p className="mt-4 text-xs uppercase tracking-wide text-zinc-500">Credits remaining</p>
            <p className="text-gradient mt-1 text-3xl font-bold">{profile?.credits ?? 0}</p>
            {profile?.captured_email && (
              <p className="mt-3 inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                Email verified
              </p>
            )}
          </div>

          <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Top up credits</p>
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
        </div>

        {referral && (
          <div className="card-elevated mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 dark:border-indigo-900 dark:bg-indigo-950/40">
            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Refer &amp; earn +5 credits</p>
            <p className="mt-1 text-xs text-indigo-700/80 dark:text-indigo-300/80">
              Share your link — when a friend signs up, you both get 5 credits.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <input
                readOnly
                value={referral.url}
                onFocus={(e) => e.target.select()}
                className="w-full rounded-lg border border-indigo-200 bg-white px-2.5 py-1.5 text-xs text-indigo-700 focus:outline-none dark:border-indigo-800 dark:bg-zinc-950 dark:text-indigo-300"
              />
              <button
                onClick={copyRef}
                className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
              >
                {refCopied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-indigo-600/80 dark:text-indigo-300/70">
              {referral.referredCount} friend{referral.referredCount === 1 ? "" : "s"} joined · {referral.creditsEarned} credits earned
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href="/campaigns"
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            My campaigns
          </Link>
          <button
            onClick={async () => {
              await logout();
            }}
            className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:bg-zinc-900 dark:hover:bg-rose-950/40"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}