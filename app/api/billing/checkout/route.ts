import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import {
  getRazorpay,
  razorpayConfigured,
  razorpayKeyId,
  planAmount,
  planLabel,
  type Plan,
} from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!razorpayConfigured()) {
    return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
  }
  const body = (await req.json().catch(() => ({}))) as { plan?: unknown };
  const plan: Plan | null = body.plan === "starter" || body.plan === "pro" ? body.plan : null;
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in before upgrading." }, { status: 401 });
  }

  const rzp = getRazorpay()!;
  try {
    const order = await rzp.orders.create({
      amount: planAmount(plan),
      currency: "INR",
      receipt: `hookai_${user.id.slice(0, 12)}_${Date.now()}`,
      notes: { userId: user.id, plan },
    });

    // Sanity-check the order shape.
    if (!order.id || !order.amount) {
      return NextResponse.json({ error: "Could not create order." }, { status: 500 });
    }

    return NextResponse.json({
      keyId: razorpayKeyId(),
      orderId: order.id,
      amount: order.amount,
      currency: "INR",
      label: planLabel(plan),
    });
  } catch (e) {
    console.error("[checkout] Razorpay error:", e);
    return NextResponse.json({ error: "Checkout failed. Please try again." }, { status: 500 });
  }
}