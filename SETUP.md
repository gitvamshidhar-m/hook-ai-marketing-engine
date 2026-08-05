# Hook AI — One-time Setup Guide

This activates the **account, saved-projects, community, and billing** layer. Do these in order; each step is ~3 minutes.

> Estimated total: **15–20 minutes.** You'll need accounts at [supabase.com](https://supabase.com) and [stripe.com](https://stripe.com) (both free).

---

## Part 1 — Supabase: run the schema (5 min)

**Why:** creates the `profiles`, `projects`, `community_hooks`, and `payments` tables plus the `spend_credit` function. Without it, sign-up fails.

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and open your project.
2. Click **SQL Editor** in the left sidebar.
3. Click **+ New query**.
4. Paste the entire contents of `supabase/schema.sql` (open it in this repo).
5. Click **Run** (or press `Ctrl+Enter`).
6. You should see **Success. No rows returned** — that's expected.

Verify it worked:
- Left sidebar → **Table Editor** → you should see `profiles`, `projects`, `community_hooks`, `payments` listed.
- Left sidebar → **Database** → **Functions** → you should see `spend_credit`.

---

## Part 2 — Supabase: enable email auth (2 min)

1. In Supabase, click **Authentication** in the left sidebar.
2. Click **Providers** (or **Sign In / Providers**).
3. Find **Email** in the list — make sure the **Enable Sign up** toggle is **ON**.
   - If it's already on, you're done.
4. (Optional) To let users sign in without email confirmation delays, click **Authentication → Sign In / Providers → Email → "Confirm email"** and decide based on how you want the flow to feel. Leave it on for safety if you're unsure.

That's it — the app uses email + password via the Supabase Auth REST API.

---

## Part 3 — Stripe: billing (10 min)

### 3a. Create your Stripe account + get keys
1. Go to [stripe.com](https://stripe.com) → **Sign up** (email + password, no card needed).
2. After setup, open **Developers** (top-right) → **API keys**.
3. Copy:
   - **Secret key** (`sk_test_…`)
   - **Publishable key** (`pk_test_…`) — not strictly needed by this app.

### 3b. Create two prices (one-time)
1. In Stripe dashboard go to **Products** → **Add product**.
2. Create product **"Starter credits"**:
   - Price: **one-time**, amount of your choice (e.g. $3), you pick the currency.
   - In the **More options → Metadata**, add `credits = 50` (informational).
   - Save → open the price → copy the **Price ID** (`price_…`) → this is `STRIPE_PRICE_STARTER`.
3. Repeat for **"Pro credits"** (e.g. $10, `credits = 250`) → copy its **Price ID** → `STRIPE_PRICE_PRO`.

### 3c. Add the webhook
1. In Stripe: **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://hook-ai-marketing-engine.vercel.app/api/billing/webhook`
3. Under **Events**, select `checkout.session.completed` (at minimum).
4. Click **Add endpoint**, then **Reveal signing secret** → copy `whsec_…` → this is `STRIPE_WEBHOOK_SECRET`.
5. Optional local testing: also add `http://localhost:3000/api/billing/webhook` via the Stripe CLI.

---

## Part 4 — Add env vars to Vercel

1. Go to your project on [vercel.com](https://vercel.com) → **Settings → Environment Variables**.
2. Add all of these (Production):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_STARTER=price_...
   STRIPE_PRICE_PRO=price_...
   ```
   (`NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY` are probably already there.)
3. Go to **Deployments → latest** → **⋮ → Redeploy** so the new vars take effect.

---

## Part 5 — Verify end to end

1. Open `https://hook-ai-marketing-engine.vercel.app` → click **Sign in free** → **Create account**.
2. You should land in the account modal showing **10 credits**.
3. Generate hooks — your credit count should drop by 1.
4. Click **Save campaign** → open **My campaigns** → your campaign should appear under "Synced to your account".
5. Open `/community` — your best hooks should appear there.
6. In the account modal, click **50 credits** → Stripe Checkout should open (use Stripe test card `4242 4242 4242 4242`).
7. After payment, credits should jump by 50 (allow a few seconds for the webhook).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Sign-up says "Sign up failed" | Run `supabase/schema.sql`; confirm **Email** provider is enabled. |
| `profiles` insert fails | Re-run the schema — the `profiles_insert_own` policy must exist. |
| Credits don't decrease | Re-deploy so env vars apply; check you're signed in. |
| Payment worked but credits didn't add | Check Stripe **Webhooks** → your endpoint → **Logs**. Webhook signing secret must match exactly. |
| Community page empty | Generate hooks again after the schema is set — inserts happen on each AI run. |

---

## What each table is for

| Table | Purpose |
|---|---|
| `profiles` | User email/name + credit balance (10 free on signup). |
| `projects` | Per-user saved campaigns (RLS: users only see their own). |
| `community_hooks` | Anonymized top hooks shown on `/community`. |
| `payments` | Ledger of Stripe checkouts (each credits granted). |
| `spend_credit(user_id)` | Atomic credit decrement (avoids race conditions). |
