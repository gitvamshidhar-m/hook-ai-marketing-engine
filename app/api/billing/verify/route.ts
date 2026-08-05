import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { razorpayConfigured, verifyRazorpaySignature, planCredits } from "@/lib/razorpay";
import { addCredits } from "@/lib/credits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!razorpayConfigured()) {
    return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    paymentId?: unknown;
    orderId?: unknown;
    signature?: unknown;
    plan?: unknown;
  };
  const paymentId = typeof body.paymentId === "string" ? body.paymentId : "";
  const orderId = typeof body.orderId === "string" ? body.orderId : "";
  const signature = typeof body.signature === "string" ? body.signature : "";
  const plan = body.plan === "starter" || body.plan === "pro" ? (body.plan as "starter" | "pro") : null;

  if (!paymentId || !orderId || !signature || !plan) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }

  if (!verifyRazorpaySignature(orderId, paymentId, signature)) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  await addCredits(user.id, planCredits(plan));
  await supabase.from("payments").insert({
    user_id: user.id,
    razorpay_order_id: orderId,
    amount_paise: 0,
    credits: planCredits(plan),
    status: "completed",
  });

  return NextResponse.json({ ok: true, credits: planCredits(plan) });
}