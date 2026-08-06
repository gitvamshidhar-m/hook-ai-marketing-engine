import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Shared (multi-instance) rate limiter backed by Upstash Redis so limits hold
 * across all of Vercel's serverless instances. Falls back to an in-memory
 * per-instance bucket if Upstash env vars aren't present.
 *
 * Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable it.
 */
const upstashEnabled = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

let limiter: Ratelimit | null = null;
if (upstashEnabled) {
  limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    analytics: true,
    prefix: "hookai",
  });
}

// In-memory fallback (per-instance; use only when Upstash is missing).
const buckets = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX = 20;

export function rateLimitKey(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return ip;
}

function tooManyResponse(): NextResponse {
  return NextResponse.json(
    { error: "Too many requests — please wait a minute and try again." },
    { status: 429 }
  );
}

export async function rateLimited(req: NextRequest): Promise<NextResponse | null> {
  const key = rateLimitKey(req);

  if (limiter) {
    try {
      const { success } = await limiter.limit(key);
      return success ? null : tooManyResponse();
    } catch (e) {
      // If Upstash fails, degrade gracefully to the in-memory bucket below.
      console.error("Upstash rate limit failed (falling back)", e);
    }
  }

  // In-memory sliding window.
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX) {
    buckets.set(key, arr);
    return tooManyResponse();
  }
  arr.push(now);
  buckets.set(key, arr);
  return null;
}