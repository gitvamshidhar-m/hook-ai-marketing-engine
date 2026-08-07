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
  {
    slug: "real-estate-hook-generator",
    channel: "ad",
    title: "Free Real Estate Hook Generator",
    metaDescription:
      "Real estate ad headlines that stop the scroll: neighborhood proof, time-to-cash framing, and homebuyer psychology. Scored by predicted CTR. Free.",
    h1: "Real Estate Hook Generator",
    intro:
      "Real estate sells on proof and timing. This tool writes short listing and lead-gen headlines that lead with neighborhood outcomes, price signals, and the moment someone stops scrolling.",
    examples: [
      { prompt: "Sell a house fast in Austin", result: "Your Home, Off the Market in 14 Days" },
      { prompt: "Relocating buyers for Omaha homes", result: "Omaha Homes Under 7 Days of Viewings" },
      { prompt: "First-time buyers in Phoenix", result: "Own a Phoenix Home for Less Than Rent" },
      { prompt: "Sellers prepping a stale listing", result: "Why Your House Hasn't Sold Yet" },
    ],
    benefits: ["Location-proofed headlines buyers read", "Timing + price signals that move leads", "Compliance-safe for real estate ads"],
    faq: faq("real estate hook"),
  },
  {
    slug: "saas-marketing-hooks-generator",
    channel: "ad",
    title: "Free SaaS Marketing Hook Generator",
    metaDescription:
      "SaaS ad and headline hooks that turn trial signups. Front-load the time-saved, threaten the status quo, and convert. Scored by CTR. Free.",
    h1: "SaaS Marketing Hook Generator",
    intro:
      "SaaS sells time saved. This tool writes headlines that name the metric you improve, the workflow you kill, and the friction you remove — so cold traffic understands value in one line.",
    examples: [
      { prompt: "CRM for small sales teams", result: "Stop Losing Leads in Your Inbox" },
      { prompt: "Project manager for agencies", result: "Ship Campaigns 2x Faster, Same Team" },
      { prompt: "Email tool for founders", result: "Cold Email That Actually Gets Replies" },
      { prompt: "AI helpdesk for startups", result: "Better Replies With Half the Team" },
    ],
    benefits: ["Metric-led angles for SaaS", "Trials and signups as the payoff", "Tested-sounding SaaS clarity"],
    faq: faq("SaaS marketing hook"),
  },
  {
    slug: "fitness-coach-hook-generator",
    channel: "ad",
    title: "Free Fitness Coach Hook Generator",
    metaDescription:
      "Fitness coaching ad hooks that sell the transformation, not the workout. Outcome + realism so the promise feels reachable. Scored by CTR. Free.",
    h1: "Fitness Coach Hook Generator",
    intro:
      "Transformation beats measurement. The engine writes gym and coaching headlines that sell the outcome (how you feel) and keep it reachable, so the promise doesn't read like a flex.",
    examples: [
      { prompt: "In-home trainer for busymoms", result: "Stronger in 20 Minutes From Your Kitchen" },
      { prompt: "Post-injury strength rebuilding", result: "Back in the Gym in 8 Weeks" },
      { prompt: "Online running coach", result: "Your First 5k With a Plan, Not Guesswork" },
      { prompt: "Over-40 accountability coaching", result: "Feel Stronger at 45 Than You Did at 30" },
    ],
    benefits: ["Outcome-first, not measurement-first", "Reachable goals that don't overpromise", "Compliance-safe for health claims"],
    faq: faq("fitness coach hook"),
  },
  {
    slug: "insurance-marketing-hook-generator",
    channel: "ad",
    title: "Free Insurance Marketing Hook Generator",
    metaDescription:
      "Insurance ad and subject hooks that stay compliant and still get clicks. Real outcomes, proof examples, and honest framing. Free.",
    h1: "Insurance Marketing Hook Generator",
    intro:
      "Insurance copy is regulated and often dry. This generator writes hooks that estimate real outcomes instead of guaranteeing them, and uses social proof plus speed — persuasion that stays inside compliance.",
    examples: [
      { prompt: "Auto insurance for new drivers", result: "New Driver Rates That Don't Feel Like a Graduation Here" },
      { prompt: "Life insurance for young families", result: "Coverage That Answers the Simple Questions" },
      { prompt: "Business liability for freelancers", result: "Protect the Contract You've Built" },
    ],
    benefits: ["Compliance-aware persuasive angles", "Proof over guarantees defaults", "Speed and fee framing done honestly"],
    faq: faq("insurance marketing hook"),
  },
  {
    slug: "local-seo-hook-generator",
    channel: "ad",
    title: "Free Local SEO Hook Generator",
    metaDescription:
      "Local SEO hooks for your Google Business Profile and local ads. Match intent, add proof, and rank the claim line with same-speakers. Free.",
    h1: "Local SEO Hook Generator",
    intro:
      "Local searches are high-intent and location-aware. Generate hooks that map to \u201cnear me\u201d intent, plug in proof counts, and keep your business profile and ads reading like the fastest, most trusted option nearby.",
    examples: [
      { prompt: "Same-day electricians in Columbus", result: "Same-Day Electrician, Licensed in Columbus" },
      { prompt: "Emergency plumbers in Raleigh", result: "Rescue Leaks Within the Hour, Raleigh" },
      { prompt: "Roof replacement in Denver", result: "Denver Roofs That Survive the Hail Season" },
    ],
    benefits: ["Intent-matched to local searches", "Proof counts built into titles", "Keeps GBP + ads on the same message"],
    faq: faq("local SEO hook"),
  },
  {
    slug: "wedding-and-event-hook-generator",
    channel: "ad",
    title: "Free Wedding & Event Hook Generator",
    metaDescription:
      "Wedding and event ad hooks that sell the moment and add a deadline. Emotional, date-driven, and scannable. Free.",
    h1: "Wedding & Event Hook Generator",
    intro: "Events and weddings are emotional and urgent. The generator names the dream and the deadline in one line — so couples recognize the thing they've been anxious about and booking.",
    examples: [
      { prompt: "A wedding florist in Charleston", result: "A Charleston Ceremony Exactly as You Dreamed" },
      { prompt: "An event DJ in Orlando", result: "Your Party's Crowd-Surge Moment, Handled" },
      { prompt: "Catering for summer weddings", result: "3 Wedding Dates Left on the The Seawedge This July" },
    ],
    benefits: ["Emotion + deadline in one line", "Date-driven urgency that books", "Scannable for mobile-final couples"],
    faq: faq("wedding and event hook"),
  },
  {
    slug: "pet-care-hook-generator",
    channel: "ad",
    title: "Free Pet Care Hook Generator",
    metaDescription:
      "Pet care ad hooks for groomers, boarding, sitters, and vets: emotional, trust-driven (owner-first) headlines that convert. Free.",
    h1: "Pet Care Hook Generator",
    intro: "Pet owners buy with their heart and vet with proof. The generator writes hooks that blend owner-to-owner warmth with a safety promise that reassures instead of scares.",
    examples: [
      { prompt: "A boarding kennel for dogs", result: "Your Dog's Vacation Home, Not a Cage" },
      { prompt: "A mobile groomer", result: "Pampered at Home: Grooming on Your Doorstep" },
      { prompt: "A cat sitter", result: "7 Days Away, Zero Guilt About the Kitty" },
    ],
    benefits: ["Owner-led emotional angles", "Safety reassures without alarm", "Trust for premium-priced care"],
    faq: faq("pet care hook"),
  },
  {
    slug: "accounting-hook-generator",
    channel: "ad",
    title: "Free Accounting Hook Generator",
    metaDescription:
      "Accounting and tax hooks that build trust: money-framed outcomes, deadline urgency, and 'the fine print' honesty. Free.",
    h1: "Accounting Hook Generator",
    intro: "Finance and tax copy has to build trust fast. The generator writes hooks framed around money, deadlines, and honest advice — so it lands with the accountant audience that needs proof.",
    examples: [
      { prompt: "Tax prep for freelancers", result: "The Tax Filing That Keeps More of Your Money" },
      { prompt: "Accounting for e-commerce", result: "Sales Tax, Finally Handled for You" },
      { prompt: "CFO for founders", result: "A CFO Priced for a Startup's Cash Burn" },
    ],
    benefits: ["Trust-anchored money framing", "Deadline urgency used ethically", "Explains complex topics simply"],
    faq: faq("accounting hook"),
  },
  {
    slug: "photography-hook-generator",
    channel: "ad",
    title: "Free Photography Hook Generator",
    metaDescription:
      "Photography ad hooks that book the shoot: own the 'good enough' pain, name the niche, and sell the memory. Free.",
    h1: "Photography Hook Generator",
    intro: "Photographers live on referrals and memory. The generator writes hook copy that acknowledges the \u201corange phone gallery\u201d pain and pitches the session as the thing you frame, not just the camera.",
    examples: [
      { prompt: "iPhone-quality family photos", result: "Frames You'll Hang, Not Just Keep" },
      { prompt: "Brand headshots for agents", result: "The Headshot That Opens Doors" },
      { prompt: "Real estate drone imagery", result: "Show the Photografie on Photos, Not Words" },
      { prompt: "Wedding photography", result: "Photos That Bring the Day Back" },
    ],
    benefits: ["Memory over camera specs", "Niche-matched gallery hooks", "Book-the-session emotionally"],
    faq: faq("photography hook"),
  },
  {
    slug: "career-coaching-hook-generator",
    channel: "ad",
    title: "Free Career Coaching Hook Generator",
    metaDescription:
      "Career and executive coaching hooks that get the interview: identity shifts, salary wins, and the next role framed confidently. Free.",
    h1: "Career Coaching Hook Generator",
    intro: "Coaching sells shifts in identity and income. The generator writes headlines around the salary win, the role change, and the confidence lift — so the right candidate says \u201cthat's me.\u201d",
    examples: [
      { prompt: "Resume for mid-career developers", result: "Land the $150k Role You're Selling — Not Settling" },
      { prompt: "Return-to-work parents", result: "Come Back Stronger, Not Slower" },
      { prompt: "Exec for execs who froze", result: "Get the Raise Your P& Already Proved" },
    ],
    benefits: ["Identity-led confidence framing", "Salary + role promises, reachable", "Speed to a new offer"],
    faq: faq("career coaching hook"),
  },
];

export function getTool(slug: string): SeoTool | undefined {
  return tools.find((t) => t.slug === slug);
}