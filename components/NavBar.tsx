"use client";

import Link from "next/link";
import { useState } from "react";
import { getAccount } from "@/lib/account";

export default function NavBar() {
  const [name] = useState(() => getAccount().name);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Hook <span className="text-indigo-500">AI</span>
        </Link>
        <span className="ml-auto flex items-center gap-3 text-sm">
          <Link href="/analytics" className="text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
            Analytics
          </Link>
          <Link href="/campaigns" className="text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
            My campaigns
          </Link>
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
            {name || "Guest"}
          </span>
        </span>
      </nav>
    </header>
  );
}