"use client";

import { useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "hookai-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    let dismissed = true;
    try {
      dismissed = localStorage.getItem(CONSENT_KEY) === "1";
    } catch {
      /* ignore */
    }
    return !dismissed;
  });

  function accept() {
    try {
      localStorage.setItem(CONSENT_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-4">
      <div className="card-elevated mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-2xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95 sm:flex-row sm:items-center">
        <p className="flex-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
          We use minimal browser storage to run the free plan (daily run limits, bonuses, and referral tracking). No
          advertising cookies. See our{" "}
          <Link href="/cookies" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Cookie Policy
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Privacy Policy
          </Link>.
        </p>
        <button
          onClick={accept}
          className="bg-gradient-brand shrink-0 rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
        >
          Got it
        </button>
      </div>
    </div>
  );
}