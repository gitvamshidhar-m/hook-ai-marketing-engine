# Hook AI — Portfolio Case Study
### "An AI growth engine that markets itself" — Digital Marketing + Growth

---

> **Live app:** https://hook-ai-marketing-engine.vercel.app
> **One-liner:** I designed, built, and shipped a live marketing-scale SaaS platform — and it is a working marketing system (SEO, email, conversion, analytics), not a mockup.

---

## 1 · The narrative

Most marketers write posts, run ads, and paste results into reports. I built the **content system
and the tool that powers it** — a product that markets itself.

**Hook AI** turns one sentence into a complete marketing campaign: CTR-predicted headline ideas
across ads, email, YouTube, and blog; a competitor gap scan; a USP storyline; and a full campaign
plan with budget, channel strategy, and content calendar.

It is both the product **and** the funnel:
1. **SEO content** pulls organic traffic in (blogs, tool pages, hubs),
2. **conversion** turns that into captured leads (A/B hero, exit-intent, CTR scoring),
3. **email automation** keeps them coming back,
4. **analytics** close the loop so I can measure what works.

I shipped it end-to-end on free tiers (Vercel + Supabase), so operating cost is near zero — proof
that I build with a marketer's budget, fast.

---

## 2 · The growth surface (what hiring managers care about)

| Growth lever | What I did | Live proof |
|---|---|---|
| **Organic SEO** | 32 blog pages, 15+ tool pages, a `/learn` hub, a `/trends` page — all in the sitemap | Indexed on production |
| **Internal linking** | Blog(post) toolbox, tool↔blog↔trends "silos" so pages rank together | Link graph in the code |
| **Search structure** | sitemap, canonical URLs, **FAQ + HowTo JSON-LD** structured data | Rich-result eligible |
| **Conversion system** | Hero headline **A/B test** (views, CTR, significance), exit-intent popup | `/growth` live |
| **Email automation** | 5 scheduled flows: nurture, re-engage, low-balance, weekly digest, hook-of-the-day | Cron, real delivery logged |
| **Measurement** | Growth funnel + analytics dashboard | `/growth`, `/analytics` |

> Replace these with real figures as they move:
> `[organic visits / month]` ← Search Console
> `[indexed pages]` ← Search Console / sitemap
> `[email subscribers]` ← captures table
> `[signups / leads]` ← `/growth`
> `[hero A/B winner CTR]` ← `/growth`

---

## 3 · What I built (an operator, not just a demo)

- **Content:** selected a niche, wrote all the copy, structured the site for long-tail SEO.
- **Growth loops:** exit popup → email nurture → referral share → win-back re-engagement.
- **Optimization:** A/B tested the hero, scored every headline 0–100 by predicted CTR, iterated.
- **Ownership:** shipped auth, payments, rate limits, scheduled emails, analytics, and AI — the real
  job of a "growth/marketing engineer."

---

## 4 · Tech stack (short, job-ready)

**Next.js 15 · React 19 · TypeScript · Tailwind · Supabase · Razorpay · Groq/Gemini AI**
Deployed on Vercel with automated tests and CI. I can explain auth, rate limiting, cron email jobs,
and the AI provider layer if asked.

---

## 5 · Interview talking points

1. **"Grow traffic 3×"** → "Add 50 more long-tail blog posts, keep the internal silos, and build a
   public 'top hooks' landing page." Each part ranks and feeds the others.
2. **"Weak leads?"** → "Gate a valuable hook behind a working email, join it to the nurture flow, and
   use exit-intent on the highest-intent pages, not spam."
3. **"Email that converts"** → "Five segmented flows with truthful sending, and a referral + digest
   loop to keep users engaged."
4. **"Show me an A/B experiment"** → "Open `/growth` — real views, CTR, p-value, and the winner
   decision."

---

## 6 · Would-do next (ambition, not a filter)

- Connect Google Search Console + GA4 and show live traffic on the site.
- Scale the blog to 80+ indexed topics.
- Run a small paid flight (Meta + Google) and log results to `/growth`.

---

*Copy to your portfolio, LinkedIn, and GitHub profile. Update the metric placeholders as numbers come in.*