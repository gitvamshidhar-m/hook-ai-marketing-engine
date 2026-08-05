import Stripe from "stripe";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-07-29.dahlia" });
}

// Price IDs for your Stripe products — set these in .env.local.
// Create products/prices in the Stripe dashboard or with `stripe prices create`.
export const PRICES = {
  starter: process.env.STRIPE_PRICE_STARTER || "", // 50 credits
  pro: process.env.STRIPE_PRICE_PRO || "", // 250 credits
};

export const CREDITS_BY_PRICE = {
  starter: 50,
  pro: 250,
};

export function stripeConfigured(): boolean {
  return Boolean(getStripe() && PRICES.starter && PRICES.pro);
}

export function getPriceCredits(priceId: string): number {
  if (priceId === PRICES.starter) return CREDITS_BY_PRICE.starter;
  if (priceId === PRICES.pro) return CREDITS_BY_PRICE.pro;
  return 0;
}

export { getStripe };
