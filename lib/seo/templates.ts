export type Template = {
  slug: string;
  niche: string;
  title: string;
  metaDescription: string;
  intro: string;
  hooks: string[];
  keywords: string[];
  toolSlug: string;
};

export const templates: Template[] = [
  {
    slug: "recruitment-agency",
    niche: "recruitment",
    title: "Recruitment Agency Marketing Hooks",
    metaDescription:
      "Proven marketing hooks for recruitment agencies — job ad openings, candidate outreach, and employer branding angles that get replies.",
    intro:
      "Recruiters compete for two audiences at once: candidates and hiring managers. These hooks are built for both — job ad openings that earn clicks and outreach lines that earn replies.",
    hooks: [
      "Cut Screening Time 70%",
      "The Recruiter Who Fills Roles in 5 Days",
      "Your Next Hire Is 2 Taps Away",
      "We Fill the Role, Not the Pipeline",
    ],
    keywords: ["recruitment marketing", "job ad hooks", "candidate outreach", "employer branding"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "real-estate",
    niche: "real estate",
    title: "Real Estate Marketing Hooks",
    metaDescription:
      "High-converting hooks for real estate agents and brokerages — listing headlines, buyer lead magnets, and seller outreach angles.",
    intro:
      "Real estate is a list-and-lead game. These hooks cover both halves — listing titles that stop the scroll and lead-magnet lines that convert cold traffic into qualified buyers and sellers.",
    hooks: [
      "Close Deals in 24h",
      "Sell in 30 Days or We Work Free",
      "The 3 Bedroom Everyone Missed",
      "Homes Here Are Priced to Move",
    ],
    keywords: ["real estate headlines", "listing titles", "real estate lead magnets", "seller outreach"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "saas-startup",
    niche: "SaaS",
    title: "SaaS Startup Marketing Hooks",
    metaDescription:
      "Bold, benefit-led hooks for SaaS startups — ad headlines, cold email subjects, and demo-day copy that drives signups.",
    intro:
      "SaaS wins on specificity. These hooks pair the outcome with the audience — 'The SDR who books demos on autopilot' — because broad claims get ignored and concrete ones get clicks.",
    hooks: [
      "Ship Campaigns 2x Faster",
      "Cold Email That Replies",
      "The Tool Your Team Will Actually Use",
      "Your Next 100 Signups, Explained",
    ],
    keywords: ["SaaS marketing hooks", "cold email subjects", "demo day copy", "B2B headlines"],
    toolSlug: "email-subject-line-generator",
  },
  {
    slug: "fitness-coach",
    niche: "fitness",
    title: "Fitness Coach Marketing Hooks",
    metaDescription:
      "Attention-grabbing hooks for fitness coaches and gyms — program launches, transformation ads, and class signup copy.",
    intro:
      "Fitness marketing runs on transformation and urgency. These hooks lead with the before-after promise and the scarcity that drives signups.",
    hooks: [
      "Lose the Last 10 lbs in 6 Weeks",
      "3 Seats Left in This Month's Cohort",
      "Stronger in 30 Days, Guaranteed",
      "The Workout Busy Moms Can Actually Do",
    ],
    keywords: ["fitness marketing hooks", "transformation ads", "gym signup copy", "coach launches"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "education-online-course",
    niche: "education",
    title: "Online Course Marketing Hooks",
    metaDescription:
      "Sales hooks for educators and course creators — enrollment emails, launch ads, and waitlist copy that converts students.",
    intro:
      "Course launches live and die on the opening line. These hooks use urgency, curiosity, and outcome promises tuned to student psychology.",
    hooks: [
      "Seats Are Going Fast",
      "Learn to Code in 90 Days",
      "The Exact Curriculum Top Schools Use",
      "Early-Bird Pricing Ends Friday",
    ],
    keywords: ["course launch hooks", "enrollment emails", "edtech headlines", "waitlist copy"],
    toolSlug: "email-subject-line-generator",
  },
  {
    slug: "finance-fintech",
    niche: "finance",
    title: "Fintech & Finance Marketing Hooks",
    metaDescription:
      "Compliant, curiosity-driven hooks for fintech and finance brands — savings, investing, and lending campaigns that convert.",
    intro:
      "Finance copy is regulated and often boring. These hooks thread the needle — persuasive angles that stay inside compliance while still earning the click.",
    hooks: [
      "Save ₹50,000/Year Without Trying",
      "Your First Investment, Explained",
      "The Card That Pays You Back",
      "Average Savings Hit 8.4% This Year",
    ],
    keywords: ["fintech marketing hooks", "finance ad copy", "savings campaigns", "compliance-safe copy"],
    toolSlug: "ad-hook-generator",
  },
];

export function getTemplate(slug: string): Template | undefined {
  return templates.find((t) => t.slug === slug);
}