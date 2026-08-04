import type { AnalyzeResult } from "./types";
import { recordCampaign } from "./supabase";

export type Campaign = {
  id: string;
  title: string;
  topic: string;
  result: AnalyzeResult;
  createdAt: string;
  updatedAt: string;
};

export type GuestAccount = {
  id: string;
  name: string;
  createdAt: string;
};

const ACCT_KEY = "hookai-account";
const CAMP_KEY = "hookai-campaigns";

function safe<T>(fn: () => T, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export function getAccount(): GuestAccount {
  return safe(() => {
    const raw = localStorage.getItem(ACCT_KEY);
    if (raw) {
      const a = JSON.parse(raw) as GuestAccount;
      if (a && a.id) return a;
    }
    const a: GuestAccount = { id: uid(), name: "Marketer", createdAt: new Date().toISOString() };
    localStorage.setItem(ACCT_KEY, JSON.stringify(a));
    return a;
  }, { id: "anon", name: "Marketer", createdAt: new Date().toISOString() });
}

export function setAccountName(name: string): GuestAccount {
  const a = getAccount();
  a.name = name.slice(0, 40) || "Marketer";
  safe(() => localStorage.setItem(ACCT_KEY, JSON.stringify(a)), undefined);
  return a;
}

export function accountRefCode(): string {
  return safe(() => {
    const a = getAccount();
    return a.id.slice(0, 8);
  }, "anon");
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function readCampaigns(): Campaign[] {
  return safe(() => JSON.parse(localStorage.getItem(CAMP_KEY) || "[]") as Campaign[], []);
}

function writeCampaigns(list: Campaign[]) {
  safe(() => localStorage.setItem(CAMP_KEY, JSON.stringify(list.slice(0, 40))), undefined);
}

export function saveCampaign(result: AnalyzeResult): Campaign {
  const now = new Date().toISOString();
  const existing = readCampaigns();
  const match = existing.find((c) => c.topic === result.topic);
  let camp: Campaign;
  if (match) {
    camp = { ...match, result, updatedAt: now };
  } else {
    camp = { id: uid(), title: result.topic, topic: result.topic, result, createdAt: now, updatedAt: now };
  }
  writeCampaigns([camp, ...existing.filter((c) => c.id !== camp.id)]);
  recordCampaign({ title: camp.title, topic: camp.topic, result });
  return camp;
}

export function listCampaigns(): Campaign[] {
  return readCampaigns().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function loadCampaign(id: string): Campaign | null {
  return readCampaigns().find((c) => c.id === id) || null;
}

export function deleteCampaign(id: string) {
  writeCampaigns(readCampaigns().filter((c) => c.id !== id));
}

export function campaignCount(): number {
  return readCampaigns().length;
}
