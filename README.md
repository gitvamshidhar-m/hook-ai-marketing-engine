# Hook AI — The Angle Discovery Engine for Marketers

An AI-powered digital marketing tool that finds the **psychological angles your competitors are missing**, generates **CTR-scored hooks** for every channel (ad headline, email subject, YouTube title, blog H1), and frames a **USP / positioning statement** — all in seconds.

Live free-hosted example stack used to build it: **Next.js + free AI tiers + zero-cost hosting**.

## Features

| Feature | What it does |
|---|---|
| **10 Psychological Angles** | Maps any topic to curiosity, loss aversion, contrarian, authority, social proof, data, story, specificity, identity, misdirection — each with the "why it works". |
| **CTR Prediction Score** | Every hook gets a 0–100 score and its psychological trigger, so A/B tests run on judgment, not guesses. |
| **Competitor Gap Scanner** | Paste competitor headlines → finds the angles they're all ignoring (your "blue ocean" openings). |
| **Angle Coverage Meter** | Live heatmap of all 10 angles — see where your campaign is concentrated vs where competitors saturate, and where the blue ocean is. |
| **Channel-Native Hooks** | Ad headlines, email subject lines, YouTube titles, blog H1s — formatted where they'll actually run. |
| **Try Harder** | Regenerate fresh hooks that deliberately avoid the psychologies you've already used. |
| **A/B Test Tracker** | Pick winners between top hooks; the tracker logs which psychology wins and shows your win rate. |
| **USP Framer** | Turns a vague description into a positioning statement + elevator pitch + differentiators. |
| **Shareable Results** | Compress a whole campaign into a shareable link (`/r?d=…`) — send it to a client or teammate. |
| **Free Tier + Waitlist** | 5 free runs/day; "try harder" variations are unlimited — classic product-led growth funnel. |
| **Live Dashboard** | Tracks hooks generated, runs, and best score in-browser (localStorage — works on free hosting, no DB). |

## How it works

1. `npm install`
2. Copy `.env.example` → `.env.local` and add a **free** AI key (optional — the built-in engine works without it):
   - **Google Gemini** (free tier): https://aistudio.google.com/apikey → `GEMINI_API_KEY`
   - or **Groq** (free tier): https://console.groq.com/keys → `GROQ_API_KEY`
3. `npm run dev` → http://localhost:3000

The tool automatically uses the AI model when a key is present, and falls back to the deterministic demo engine otherwise — so it's fully demo-able with zero setup.

## Free hosting (Vercel — $0/month)

1. Push this repo to GitHub.
2. Go to https://vercel.com/new → Import the repo → Deploy.
3. In **Project → Settings → Environment Variables**, add `GEMINI_API_KEY` (and/or `GROQ_API_KEY`).
4. Deploy. Done — free SSL, free hosting, generous free AI-tier limits.

Other free options: **Netlify** (free), **Cloudflare Pages** (free).

## Optional: Supabase persistence (free tier) for cross-user analytics

1. Create a free project at https://supabase.com
2. Run this SQL in the SQL editor:

```sql
create table if not exists hook_ai_stats (
  id bigint generated always as identity primary key,
  topic text,
  hooks int,
  best_score int,
  ai_powered boolean,
  created_at timestamptz default now()
);
alter table hook_ai_stats enable row level security;
create policy "anon insert" on hook_ai_stats for insert to anon with check (true);
```

3. Add to Vercel env vars (all public-safe, so `NEXT_PUBLIC_` is fine):
   - `NEXT_PUBLIC_SUPABASE_URL` — from Project Settings → API
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Project Settings → API
   - `NEXT_PUBLIC_SUPABASE_TABLE` = `hook_ai_stats`

Each generation then records a row — giving you real cross-user numbers for your CV ("N hooks generated across all users").

## CV pitch (for recruiters)

> Built **Hook AI**, a self-shipped AI SaaS product for digital marketers: a hook/angle discovery engine that generates CTR-predicted headlines across 4 channels, runs a competitor gap + angle-coverage analysis, and frames USPs. Includes an A/B test tracker that learns which psychological trigger wins, shareable compressed-result links, a free-tier/limits funnel, and optional Supabase-backed cross-user analytics. Architected on Next.js with an AI-provider abstraction layer (Gemini/Groq) that degrades gracefully to a no-API-key demo mode. Shipped to a free tier (Vercel) — **0 hosting cost, no database dependency required**.

Numbers to add once it's live: active users, hooks generated, average best-score across users, signup→generate conversion.

## Project structure

```
app/
  page.tsx             # landing + tool page
  r/page.tsx           # read-only shared-results page (/r?d=…)
  api/analyze/route.ts # API endpoint (validates input, picks AI or engine)
components/
  HookTool.tsx         # form + free-tier limits + orchestrates runs
  ResultView.tsx       # results display (Hooks / Angles / Gap Scan / USP / Intelligence)
  IntelligencePanel.tsx# angle coverage meter + competitor heatmap
  AbTestTracker.tsx    # A/B head-to-head tracker with win-rate learning
  Dashboard.tsx        # in-browser usage stats
lib/
  types.ts             # shared types + angle categories
  psych.ts             # hook → psychology-trigger classifier (shared)
  engine.ts            # deterministic hook/angle/gap/USP engine (no-AI mode)
  ai.ts                # Gemini + Groq providers, per-channel prompts, fallback
  analytics.ts         # coverage computation + gzip share-link encode/decode
  supabase.ts          # optional REST-based usage recording (env-gated)
.env.example
```

## Scripts

- `npm run dev` — local dev
- `npm run build` — production build (type-checks)
- `npm run lint` — ESLint
