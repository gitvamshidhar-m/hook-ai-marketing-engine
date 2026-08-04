import { accountRefCode } from "./account";

const BONUS_KEY = "hookai-bonus";
const REF_KEY = "hookai-referred";

type BonusState = Record<string, number>; // date -> bonus runs earned

function safe<T>(fn: () => T, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return fn();
  } catch {
    return fallback;
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function readBonus(): BonusState {
  return safe(() => JSON.parse(localStorage.getItem(BONUS_KEY) || "{}"), {});
}

function writeBonus(s: BonusState) {
  safe(() => localStorage.setItem(BONUS_KEY, JSON.stringify(s)), undefined);
}

/** Bonus runs granted today via sharing. Cap at 3/day. */
export function bonusRunsToday(): number {
  const s = readBonus();
  return s[today()] || 0;
}

export function remainingWithBonus(freeDaily: number, usedToday: number): number {
  const bonus = Math.max(0, freeDaily + bonusRunsToday() - usedToday);
  return bonus;
}

/** Grant +1 bonus run when the user shares results (max 3/day). Returns true if granted. */
export function earnBonusOnShare(): boolean {
  const s = readBonus();
  const cur = s[today()] || 0;
  if (cur >= 3) return false;
  s[today()] = cur + 1;
  writeBonus(s);
  return true;
}

/** Append the referrer code to an existing share URL. */
export function buildShareUrl(fullUrl: string): string {
  const sep = fullUrl.includes("?") ? "&" : "?";
  return `${fullUrl}${sep}ref=${accountRefCode()}`;
}

export type ReferralInfo = {
  refCode: string | null;
  firstTime: boolean;
};

/** Detect ?ref= from the current page and record it once. */
export function detectReferral(): ReferralInfo {
  if (typeof window === "undefined") return { refCode: null, firstTime: false };
  const ref = new URLSearchParams(window.location.search).get("ref");
  if (!ref) return { refCode: null, firstTime: false };
  const seen = safe(() => localStorage.getItem(REF_KEY), "");
  if (seen === ref) return { refCode: ref, firstTime: false };
  safe(() => localStorage.setItem(REF_KEY, ref), undefined);
  return { refCode: ref, firstTime: true };
}
