import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const supabase = await createServerSupabase();

  // Structured product events (anonymous + authed).
  const { data: events } = await supabase.from("events").select("id,name,created_at").limit(3000);

  // Anonymous email captures (anonymous-first funnel).
  const { data: captures } = await supabase.from("captures").select("id,created_at");

  // Signed-up users + attribution.
  const { data: profiles } = await supabase
    .from("profiles")
    .select("created_at,utm_source,utm_medium,captured_email");

  const byEvent: Record<string, number> = {};
  (events || []).forEach((e) => {
    byEvent[e.name] = (byEvent[e.name] || 0) + 1;
  });

  const bySource: Record<string, number> = {};
  let capturedEmails = 0;
  (profiles || []).forEach((p) => {
    if (p.captured_email) capturedEmails += 1;
    if (p.utm_source) bySource[p.utm_source] = (bySource[p.utm_source] || 0) + 1;
  });

  const eventCount = events?.length || 0;
  const captureCount = captures?.length || 0;
  const signupCount = profiles?.length || 0;

  // AIDA-like funnel: wide → narrow.
  const funnel = [
    { stage: "Interactions (events)", count: eventCount },
    { stage: "Email captured (anon + authed)", count: captureCount + capturedEmails },
    { stage: "Signed up", count: signupCount },
  ];

  return NextResponse.json({
    byEvent,
    bySource,
    funnel,
    raw: {
      events: eventCount,
      captures: captureCount,
      signups: signupCount,
      capturedProfiles: capturedEmails,
    },
  });
}