"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

type Overview = {
  users: number;
  payments: number;
  revenue_paise: number;
  communityHooks: number;
  projects: number;
  shares: number;
};

type CommunityRow = { id: number; hook: string; score: number; topic: string | null; created_at: string };
type PaymentRow = { id: string; email: string | null; amount_paise: number; credits: number; status: string; created_at: string };

type Funnel = {
  byEvent: Record<string, number>;
  bySource: Record<string, number>;
  funnel: { stage: string; count: number }[];
  raw: { events: number; captures: number; signups: number; capturedProfiles: number };
};

const FUNNEL_WIDTHS = ["bg-emerald-500", "bg-indigo-500", "bg-violet-500"];

export default function AdminPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [community, setCommunity] = useState<CommunityRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [o, c, p, f] = await Promise.all([
        fetch("/api/admin/overview").then((r) => (r.ok ? r.json() : Promise.reject(new Error("overview")))),
        fetch("/api/admin/community").then((r) => (r.ok ? r.json() : Promise.reject(new Error("community")))),
        fetch("/api/admin/payments").then((r) => (r.ok ? r.json() : Promise.reject(new Error("payments")))),
        fetch("/api/admin/funnel").then((r) => (r.ok ? r.json() : null)),
      ]);
      setOverview(o);
      setCommunity(c);
      setPayments(p);
      setFunnel(f);
    } catch {
      setError("Could not load admin data — are you signed in as an admin?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.resolve().then(() => {
      if (active) load();
    });
    return () => {
      active = false;
    };
  }, [user]);

  async function removeHook(id: number) {
    const res = await fetch("/api/admin/community", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setCommunity((list) => list.filter((c) => c.id !== id));
  }

  if (!user) {
    return (
      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 py-24 text-center">
          <p className="text-xl font-semibold">Sign in to access admin.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin dashboard</h1>
            <p className="mt-1 text-sm text-zinc-500">Platform overview, payments, and community moderation.</p>
          </div>
          <button
            onClick={load}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
            {error}
          </p>
        )}

        {overview && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {(
              [
                ["Users", overview.users],
                ["Payments", overview.payments],
                ["Revenue (₹)", (overview.revenue_paise / 100).toLocaleString("en-IN")],
                ["Community hooks", overview.communityHooks],
                ["Projects", overview.projects],
                ["Share links", overview.shares],
              ] as [string, string | number][]
            ).map(([label, val]) => (
              <div key={label} className="card-elevated rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
                <p className="text-gradient mt-1 text-2xl font-bold">{val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Growth funnel */}
        {funnel && (
          <div className="card-elevated mt-8 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="border-b border-zinc-200 px-5 py-4 font-semibold dark:border-zinc-800">
              Growth funnel &amp; attribution
            </h2>
            <div className="grid gap-6 p-5 md:grid-cols-2">
              <div>
                <p className="mb-3 text-xs uppercase tracking-wide text-zinc-500">Wide → narrow</p>
                {funnel.funnel.map((stage, i) => {
                  const max = Math.max(...funnel.funnel.map((s) => s.count), 1);
                  return (
                    <div key={stage.stage} className="mb-3">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{stage.stage}</span>
                        <span className="font-semibold">{stage.count.toLocaleString()}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className={`h-full rounded-full ${FUNNEL_WIDTHS[i]}`}
                          style={{ width: `${Math.max((stage.count / max) * 100, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(funnel.byEvent).length > 0 && (
                  <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                    <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Events</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(funnel.byEvent).map(([k, v]) => (
                        <span key={k} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium dark:bg-zinc-800">
                          {k} · {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <p className="mb-3 text-xs uppercase tracking-wide text-zinc-500">Signup attribution by channel</p>
                {Object.keys(funnel.bySource).length === 0 ? (
                  <p className="text-sm text-zinc-500">No attributed signups yet — UTM params get captured on first touch.</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(funnel.bySource)
                      .sort((a, b) => b[1] - a[1])
                      .map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
                          <span className="font-medium">{k}</span>
                          <span className="font-semibold">{v}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Community moderation */}
        <div className="card-elevated mt-10 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="border-b border-zinc-200 px-5 py-4 font-semibold dark:border-zinc-800">Community feed · moderation</h2>
          {community.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-zinc-500">No hooks yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                    <th className="px-5 py-3">Hook</th>
                    <th className="px-5 py-3">Score</th>
                    <th className="px-5 py-3">Topic</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {community.map((c) => (
                    <tr key={c.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950">
                      <td className="max-w-md px-5 py-3 font-medium">{c.hook}</td>
                      <td className="px-5 py-3 font-semibold text-emerald-600 dark:text-emerald-400">{c.score}</td>
                      <td className="px-5 py-3 text-zinc-500">{c.topic || "—"}</td>
                      <td className="px-5 py-3 text-zinc-500">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => removeHook(c.id)}
                          className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payments ledger */}
        <div className="card-elevated mt-8 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="border-b border-zinc-200 px-5 py-4 font-semibold dark:border-zinc-800">Payments ledger</h2>
          {payments.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-zinc-500">No payments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Credits</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950">
                      <td className="px-5 py-3">{p.email || "—"}</td>
                      <td className="px-5 py-3 font-semibold">₹{(p.amount_paise / 100).toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3">{p.credits}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-zinc-500">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}