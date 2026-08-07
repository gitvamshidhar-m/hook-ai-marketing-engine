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
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
          <Link href="/tools" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
            Free tools
          </Link>
          <Link href="/templates" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
            Templates
          </Link>
          <Link href="/blog" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
            Blog
          </Link>
          <Link href="/learn" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
            Learn
          </Link>
          <Link href="/trends" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
            Trends
          </Link>
          <Link href="/about" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
            About
          </Link>
          <Link href="/community" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
            Community
          </Link>
          <Link href="/analytics" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
            Analytics
          </Link>
          <Link href="/growth" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
            Growth
          </Link>
          <Link href="/seo" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
            SEO
          </Link>
          <Link href="/challenge" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
            Challenge
          </Link>
          <Link href="/pricing" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
            Pricing
          </Link>
          <Link href="/terms" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
            Terms
          </Link>
          <Link href="/privacy" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
            Privacy
          </Link>
          <Link href="/cookies" className="transition hover:text-zinc-800 dark:hover:text-zinc-200">
            Cookies
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
      </div>
    </footer>
  );
}
