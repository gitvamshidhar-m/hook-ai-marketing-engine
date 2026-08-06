import type { Channel } from "@/lib/types";

export type SeoTool = {
  slug: string;
  channel: Channel;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  examples: { prompt: string; result: string }[];
  benefits: string[];
  faq: { q: string; a: string }[];
};

function faq(kind: string): { q: string; a: string }[] {
  return [
    {
      q: `Is the ${kind} generator free to use?`,
      a: "Yes. Anonymous users get a small daily allowance so you can try it risk-free; sign in for more.",
    },
    {
      q: "How does Hook AI predict performance?",
      a: `Each ${kind} is scored against psychology triggers, clarity, and length so the strongest option surfaces first. Regenerate anytime for a fresh angle.`,
    },
    {
      q: "Can I use the results commercially?",
      a: "Yes. Copy the output into your ads, emails, and pages — results are yours once generated.",
    },
  ];
}

export const tools: SeoTool[] = [
  {
    slug: "ad-hook-generator",
    channel: "ad",
    title: "Free AI Ad Headline Generator",
    metaDescription:
      "Generate CTR-predicted Google & Meta ad headlines in seconds. Front-load the payoff, pick a psychological angle, and copy the best-performing option. 100% free.",
    h1: "Ad Headline Generator",
    intro:
      "Front-load the payoff. This tool writes short, bold Meta and Google ad headlines under 6 words that respect ad compliance rules and rank by expected CTR — so the strongest angle surfaces first.",
    examples: [
      { prompt: "AI resume screening for recruiters", result: "Cut Screening Time 70%" },
      { prompt: "Project management for small agencies", result: "Ship Campaigns 2x Faster" },
      { prompt: "CRM for real estate agents", result: "Close Deals in 24h" },
      { prompt: "Email tool for SaaS founders", result: "Cold Email That Replies" },
    ],
    benefits: ["Sub-6-word headlines that fit ad limits", "Psych-led angles: urgency, curiosity, FOMO", "Sanity-checked for compliance and clickbait"],
    faq: faq("ad headline"),
  },
  {
    slug: "email-subject-line-generator",
    channel: "email",
    title: "Free AI Email Subject Line Generator",
    metaDescription:
      "Write curiosity + urgency email subject lines that get opened. Predict open-rate potential, avoid spammy phrasing, and pick from ranked options. 100% free.",
    h1: "Email Subject Line Generator",
    intro:
      "3–8 word email subjects with curiosity and urgency baked in. This tool avoids spam trigger words, predicts the emotional pull, and ranks subject lines from best to weakest.",
    examples: [
      { prompt: "Onboarding new SaaS users", result: "RE: your next 30 days" },
      { prompt: "Re-engaging churned subscribers", result: "We miss you. Here's 2x credit" },
      { prompt: "Launching a course", result: "Seats are going fast" },
    ],
    benefits: ["3–8 word subjects built to be opened", "Curiosity and urgency framing by default", "Spam-trigger and clickbait filters"],
    faq: faq("email subject line"),
  },
  {
    slug: "youtube-title-generator",
    channel: "youtube",
    title: "Free AI YouTube Title Generator",
    metaDescription:
      "Craft curiosity-first YouTube titles under 55 chars that rank and get clicks. Get scored title options for any video. 100% free.",
    h1: "YouTube Title Generator",
    intro:
      "40–55 character titles with curiosity FIRST, then the payoff. This tool maximizes click-through for videos by balancing a compelling front-loaded promise with readable length.",
    examples: [
      { prompt: "A day as a recruiter at a startup", result: "I Broke My Recruiting Record in 24h" },
      { prompt: "How to automate cold outreach", result: "The 10-min outreach that replies" },
      { prompt: "Studio setup for creators", result: "My $800 setup that looks pro" },
    ],
    benefits: ["40–55 chars — the sweet spot for CTR", "Curiosity-first readability", "Scored options from multiple psychological angles"],
    faq: faq("YouTube title"),
  },
  {
    slug: "blog-h1-generator",
    channel: "blog",
    title: "Free AI Blog Title Generator",
    metaDescription:
      "Generate clear, specific blog H1 titles with numbers and exact promises that rank. Get ranked, authority-building headlines for any topic. 100% free.",
    h1: "Blog Title Generator",
    intro:
      "6–10 word H1s that are clear, specific, and use concrete promises — 'the exact way' — so both readers and search engines understand the value instantly.",
    examples: [
      { prompt: "Recruiting cost mistakes", result: "The 7 Costly Mistakes in Recruiting" },
      { prompt: "Ad creative testing", result: "How to Test Ads the Exact Way A-Players Do" },
      { prompt: "Freelance pricing", result: "The Exact Formula Freelancers Use to Price" },
    ],
    benefits: ["6–10 word authority-building titles", "Numbers and exact-method framing", "Clear intent for readers and Google"],
    faq: faq("blog title"),
  },
];

export function getTool(slug: string): SeoTool | undefined {
  return tools.find((t) => t.slug === slug);
}