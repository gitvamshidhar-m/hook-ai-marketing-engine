"use client";

import Link from "next/link";
import { useState } from "react";
import { getAccount } from "@/lib/account";

export default function NavBar() {
  const [name] = useState(() => getAccount().name);

  return (
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
        <span className="ml-auto flex items-center gap-1.5 text-sm">
          <Link
            href="/analytics"
            className="rounded-lg px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
          >
            Analytics
          </Link>
          <Link
            href="/campaigns"
            className="rounded-lg px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
          >
            My campaigns
          </Link>
          <span className="ml-2 flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
            {name || "Guest"}
          </span>
        </span>
      </nav>
    </header>
  );
}
