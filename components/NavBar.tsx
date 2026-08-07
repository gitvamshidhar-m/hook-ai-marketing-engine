"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import AuthModal from "./AuthModal";

export default function NavBar() {
  const { user, profile, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/75 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/75">
        <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="bg-gradient-brand flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-lg shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M13 2 4.5 13.5h6L11 22l8.5-11.5h-6L13 2Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="text-lg font-bold tracking-tight">
              Hook<span className="text-gradient">AI</span>
            </span>
          </Link>
          <span className="ml-auto flex items-center gap-1 text-sm">
            <Link
              href="/tools"
              className="rounded-lg px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              Tools
            </Link>
            <Link
              href="/community"
              className="rounded-lg px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              Community
            </Link>
            <Link
              href="/analytics"
              className="rounded-lg px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              Analytics
            </Link>
            <Link
              href="/growth"
              className="rounded-lg px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              Growth
            </Link>
            <Link
              href="/challenge"
              className="rounded-lg px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              Challenge
            </Link>
            <Link
              href="/blog"
              className="rounded-lg px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              Blog
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/campaigns"
              className="rounded-lg px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              My campaigns
            </Link>
            <Link
              href="/campaign"
              className="rounded-lg px-3 py-1.5 font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
            >
              Campaign Studio
            </Link>
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-lg px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
              >
                Admin
              </Link>
            )}
            {user && (
              <Link
                href="/account"
                className="rounded-lg px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
              >
                Account
              </Link>
            )}
            {user ? (
              <button
                onClick={() => setAuthOpen(true)}
                className="ml-2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden />
                {profile?.name || "Account"}
                {typeof profile?.credits === "number" && (
                  <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                    {profile.credits} cr
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                disabled={loading}
                className="bg-gradient-brand ml-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? "…" : "Sign in free"}
              </button>
            )}
          </span>
        </nav>
      </header>
      {authOpen && <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />}
    </>
  );
}
