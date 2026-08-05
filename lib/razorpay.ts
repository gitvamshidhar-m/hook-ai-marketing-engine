import Razorpay from "razorpay";
import crypto from "crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export function razorpayConfigured(): boolean {
  return Boolean(KEY_ID && KEY_SECRET);
}

export function razorpayKeyId(): string {
  return KEY_ID;
}

export function getRazorpay(): Razorpay | null {
  if (!razorpayConfigured()) return null;
  return new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
}

export type Plan = "starter" | "pro";

// Amounts in paise (₹1 = 100 paise). Override via env if you like.
const PLAN_AMOUNT: Record<Plan, number> = {
  starter: Number(process.env.RAZORPAY_STARTER_AMOUNT || 19900), // ₹199
  pro: Number(process.env.RAZORPAY_PRO_AMOUNT || 49900), // ₹499
};
const PLAN_CREDITS: Record<Plan, number> = { starter: 50, pro: 250 };
const PLAN_LABEL: Record<Plan, string> = { starter: "50 credits", pro: "250 credits" };

export function planAmount(plan: Plan): number {
  return PLAN_AMOUNT[plan];
}
export function planCredits(plan: Plan): number {
  return PLAN_CREDITS[plan];
}
export function planLabel(plan: Plan): string {
  return PLAN_LABEL[plan];
}

// Razorpay signature = HMAC-SHA256(secret, `${order_id}|${payment_id}`)
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const expected = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// Webhook signature = HMAC-SHA256(secret, rawBody)
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const expected = crypto.createHmac("sha256", KEY_SECRET).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}