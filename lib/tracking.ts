"use client";

const ATTR_KEY = "hookai-attr";
const EMAIL_BONUS_KEY = "hookai-emailbonus";

export type Attribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  ref?: string;
  referrer?: string;
};

function safe<T>(fn: () => T, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export function getAttribution(): Attribution {
  return safe(() => JSON.parse(localStorage.getItem(ATTR_KEY) || "{}"), {});
}

/** Persist UTM / ref / referrer on first touch so signups can be attributed later. */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const existing = getAttribution();
  const sp = new URLSearchParams(window.location.search);
  const next: Attribution = {
    source: existing.source || sp.get("utm_source") || undefined,
    medium: existing.medium || sp.get("utm_medium") || undefined,
    campaign: existing.campaign || sp.get("utm_campaign") || undefined,
    ref: existing.ref || sp.get("ref") || undefined,
    referrer: existing.referrer || (document.referrer && new URL(document.referrer).hostname) || undefined,
  };
  if (!existing.source && !existing.medium && !existing.campaign && !existing.ref && !next.referrer) return {};
  try {
    localStorage.setItem(ATTR_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

/** Fire-and-forget client-side structured event. */
export function track(name: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, props: props || {}, attribution: getAttribution() }),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function emailBonusRunsToday(): number {
  const s = safe(() => JSON.parse(localStorage.getItem(EMAIL_BONUS_KEY) || "{}"), {});
  return typeof s[today()] === "number" ? s[today()] : 0;
}

/** One-time +5 bonus runs per day for capturing an email. */
export function grantEmailBonus(): number {
  const s = safe(() => JSON.parse(localStorage.getItem(EMAIL_BONUS_KEY) || "{}"), {});
  if (s[today()] >= 5) return 0;
  s[today()] = 5;
  safe(() => localStorage.setItem(EMAIL_BONUS_KEY, JSON.stringify(s)), undefined);
  return 5;
}

export function isEmailBonusClaimed(): boolean {
  return emailBonusRunsToday() >= 5;
}