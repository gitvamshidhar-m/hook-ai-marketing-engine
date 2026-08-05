import { NextRequest, NextResponse } from "next/server";

// Simple in-memory sliding-window rate limiter.
// Per-deployment instance; good enough for the free tier.
const buckets = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX = 20;

export function rateLimitKey(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return ip;
}

export function checkRateLimit(key: string, max = MAX): boolean {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= max) {
    buckets.set(key, arr);
    return false;
  }
  arr.push(now);
  buckets.set(key, arr);
  return true;
}

export function rateLimited(req: NextRequest): NextResponse | null {
  const key = rateLimitKey(req);
  if (!checkRateLimit(key)) {
    return NextResponse.json(
      { error: "Too many requests — please wait a minute and try again." },
      { status: 429 }
    );
  }
  return null;
}
