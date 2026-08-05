"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [year] = useState(() => new Date().getFullYear());

  return (
    <footer className="mt-auto border-t border-zinc-200/70 bg-white/75 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/75">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row">
        <p className="text-xs text-zinc-500">
          © {year} Hook AI · The angle discovery engine for marketers
        </p>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <Link href="/community" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
            Community
          </Link>
          <Link href="/analytics" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
            Analytics
          </Link>
          <a
            href="https://github.com/gitvamshidhar-m/hook-ai-marketing-engine"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            GitHub
          </a>
        </div>
        <p className="text-xs text-zinc-400">
          Built with Next.js · Supabase · Stripe · Groq
        </p>
      </div>
    </footer>
  );
}
