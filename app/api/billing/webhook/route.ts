import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { addCredits } from "@/lib/credits";
import { getStripe, getPriceCredits } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  const rawBody = Buffer.from(await req.arrayBuffer());

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig || "", webhookSecret);
  } catch (e) {
    console.error("[webhook] signature invalid:", e);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = await createServerSupabase();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.client_reference_id || session.metadata?.userId;
      const priceId = typeof session.line_items === "object" ? session.line_items?.data?.[0]?.price?.id : null;
      let resolvedPriceId = priceId;
      if (!resolvedPriceId && session.metadata?.plan) {
        resolvedPriceId = process.env[`STRIPE_PRICE_${session.metadata.plan.toUpperCase()}`] || "";
      }
      const credits = getPriceCredits(resolvedPriceId || "");
      if (userId && credits > 0) {
        await addCredits(userId, credits);
        await supabase.from("payments").insert({
          user_id: userId,
          stripe_checkout_id: session.id,
          stripe_event_id: event.id,
          amount_cents: session.amount_total || 0,
          credits,
          status: "completed",
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}