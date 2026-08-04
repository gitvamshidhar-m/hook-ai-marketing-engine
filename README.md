# Hook AI — The Angle Discovery Engine for Marketers

An AI-powered digital marketing tool that finds the **psychological angles your competitors are missing**, generates **CTR-scored hooks** for every channel (ad headline, email subject, YouTube title, blog H1), and frames a **USP / positioning statement** — all in seconds.

Live free-hosted example stack used to build it: **Next.js + free AI tiers + zero-cost hosting**.

## Features

| Feature | What it does |
|---|---|
| **10 Psychological Angles** | Maps any topic to curiosity, loss aversion, contrarian, authority, social proof, data, story, specificity, identity, misdirection — each with the "why it works". |
| **CTR Prediction Score** | Every hook gets a 0–100 score and its psychological trigger, so A/B tests run on judgment, not guesses. |
| **Competitor Gap Scanner** | Paste competitor headlines → finds the angles they're all ignoring (your "blue ocean" openings). |
| **Channel-Native Hooks** | Ad headlines, email subject lines, YouTube titles, blog H1s — formatted where they'll actually run. |
| **USP Framer** | Turns a vague description into a positioning statement + elevator pitch + differentiators. |
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

Other free options: **Netlify** (free), **Cloudflare Pages** (free), and add a free **Supabase** DB later if you want server-side analytics.

## CV pitch (for recruiters)

> Built **Hook AI**, a self-shipped AI SaaS product for digital marketers: a hook/angle discovery engine that generates CTR-predicted headlines across 4 channels, runs a competitor gap analysis, and frames USPs. Architected on Next.js with an AI-provider abstraction layer (Gemini/Groq) that degrades gracefully to a no-API-key demo mode. Shipped to a free tier (Vercel) with live in-browser analytics — **0 hosting cost, no database dependency**.

Numbers to add once it's live: active users, hooks generated, average best-score across users, signup→generate conversion.

## Project structure

```
app/
  page.tsx             # landing + tool page
  api/analyze/route.ts # API endpoint (validates input, picks AI or engine)
components/
  HookTool.tsx         # interactive tool (form + 4 result tabs)
  Dashboard.tsx        # in-browser usage stats
lib/
  types.ts             # shared types + angle categories
  engine.ts            # deterministic hook/angle/gap/USP engine (no-AI mode)
  ai.ts                # Gemini + Groq providers, JSON-hook parsing, fallback
.env.example
```

## Scripts

- `npm run dev` — local dev
- `npm run build` — production build (type-checks)
- `npm run lint` — ESLint
