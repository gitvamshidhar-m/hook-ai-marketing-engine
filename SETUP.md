# Hook AI — One-time Setup Guide

This activates the **account, saved-projects, community, and billing** layer. Do these in order; each step is ~3 minutes.

> Estimated total: **15–20 minutes.** You'll need accounts at [supabase.com](https://supabase.com) and [razorpay.com](https://razorpay.com) (both free).

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

## Part 3 — Razorpay: billing (10 min)

> Razorpay is used instead of Stripe because it fully supports Indian businesses.

### 3a. Create your Razorpay account + get keys
1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com) → **Register** (email + phone + business details).
2. After login, go to **Settings → API Keys** (top-right → account menu, then Settings → API Keys).
3. Click **Generate Test Keys** → copy:
   - **Key ID** (`rzp_test_…`) → this is `RAZORPAY_KEY_ID`
   - **Key Secret** (`…`) → this is `RAZORPAY_KEY_SECRET`
4. Keep the page open — you'll need the keys for Part 4.

### 3b. Pick your prices (no product setup needed)
The plan amounts live in code, not the dashboard:
- **Starter** → 50 credits, default ₹199 (`RAZORPAY_STARTER_AMOUNT=19900` in paise)
- **Pro** → 250 credits, default ₹499 (`RAZORPAY_PRO_AMOUNT=49900` in paise)

Optional: change the values by setting the env vars above in Vercel. Amounts are in **paise** (₹1 = 100 paise).

### 3c. No webhook needed
Credits are granted immediately after Razorpay's **client-side signature verification** (`/api/billing/verify`) — the standard Razorpay flow. Nothing else to configure.

---

## Part 4 — Add env vars to Vercel

1. Go to your project on [vercel.com](https://vercel.com) → **Settings → Environment Variables**.
2. Add all of these (Production):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   ```
   (Optional amounts, in paise: `RAZORPAY_STARTER_AMOUNT`, `RAZORPAY_PRO_AMOUNT`.)
   (`NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY` are probably already there.)
3. Go to **Deployments → latest** → **⋮ → Redeploy** so the new vars take effect.

---

## Part 5 — Verify end to end

1. Open `https://hook-ai-marketing-engine.vercel.app` → click **Sign in free** → **Create account**.
2. You should land in the account modal showing **10 credits**.
3. Generate hooks — your credit count should drop by 1.
4. Click **Save campaign** → open **My campaigns** → your campaign should appear under "Synced to your account".
5. Open `/community` — your best hooks should appear there.
6. In the account modal, click **50 credits** → the Razorpay checkout should open. Use a **test card**:
   - Card number: `4111 1111 1111 1111`
   - Expiry: any future date, CVV: any 3 digits, OTP: `1234` (or any)
7. After payment, the modal should refresh and credits jump by 50 immediately.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Sign-up says "Sign up failed" | Run `supabase/schema.sql`; confirm **Email** provider is enabled. |
| `profiles` insert fails | Re-run the schema — the `profiles_insert_own` policy must exist. |
| Credits don't decrease | Re-deploy so env vars apply; check you're signed in. |
| Checkout says "Billing not configured" | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` missing or not redeployed. |
| "Payment verification failed" | Signature mismatch — usually wrong `RAZORPAY_KEY_SECRET` in Vercel. |
| Credits didn't add after paying | Test card OTP failed; retry. Razorpay test payments are simulated — no real charge. |
| Community page empty | Generate hooks again after the schema is set — inserts happen on each AI run. |

---

## What each table is for

| Table | Purpose |
|---|---|
| `profiles` | User email/name + credit balance (10 free on signup). |
| `projects` | Per-user saved campaigns (RLS: users only see their own). |
| `community_hooks` | Anonymized top hooks shown on `/community`. |
| `payments` | Ledger of Razorpay orders (each credits granted). |
| `spend_credit(user_id)` | Atomic credit decrement (avoids race conditions). |
