import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { getStripe, PRICES, stripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
  }
  const body = (await req.json().catch(() => ({}))) as { plan?: unknown };
  const plan = body.plan === "starter" || body.plan === "pro" ? body.plan : null;
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }
  const priceId = PRICES[plan];
  if (!priceId) return NextResponse.json({ error: "Plan price not configured." }, { status: 500 });

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in before upgrading." }, { status: 401 });
  }

  const origin = req.headers.get("origin") || "https://hook-ai-marketing-engine.vercel.app";
  const stripe = getStripe()!;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/#tool?upgraded=1`,
      cancel_url: `${origin}/#tool`,
      client_reference_id: user.id,
      metadata: { userId: user.id, plan },
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[checkout] Stripe error:", e);
    return NextResponse.json({ error: "Checkout failed." }, { status: 500 });
  }
}
