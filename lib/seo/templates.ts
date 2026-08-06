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
  {
    slug: "dental-practice",
    niche: "dental",
    title: "Dental Practice Marketing Hooks",
    metaDescription: "Patient-getting hooks for dental clinics and dentists — new patient offers, gentle dentistry, and smile makeover campaigns.",
    intro: "Dental marketing runs on fear and aspiration. These hooks pair pain-point empathy with the promise of painless, modern care.",
    hooks: [
      "Gentle Dentistry You'll Actually Look Forward To",
      "New Patient Special — Exam + X-Rays for ₹499",
      "The Smile Makeover That Took 2 Visits",
      "Sedation Dentistry for Scared Patients",
    ],
    keywords: ["dental marketing", "dentist ad copy", "new patient offers", "dental SEO"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "ecommerce-store",
    niche: "e-commerce",
    title: "E-commerce Store Marketing Hooks",
    metaDescription: "Conversion hooks for online stores — product ad headlines, abandoned-cart emails, and collection page copy.",
    intro: "Stores win on specificity and scarcity. These hooks pair a concrete outcome with the friction of 'act now'.",
    hooks: [
      "The Tee You'll Wear 3x a Week",
      "50% Off Today Only — No Code Needed",
      "Your Cart Missed You (And 1 Item Is Low Stock)",
      "Rated 4.9 by 12,000 Buyers",
    ],
    keywords: ["ecommerce ad copy", "product headlines", "abandoned cart emails", "shop ads"],
    toolSlug: "email-subject-line-generator",
  },
  {
    slug: "nutrition-dietitian",
    niche: "nutrition",
    title: "Nutrition & Dietitian Marketing Hooks",
    metaDescription: "Marketing hooks for dietitians and nutrition coaches — program offers, meal plan ads, and weight loss campaigns.",
    intro: "Nutrition coaching sells trust and outcomes. These hooks lead with results that are achievable, not magic.",
    hooks: [
      "Eat More, Weigh Less — The 80/20 Plan",
      "Custom Meal Plans, No Boring Diet Food",
      "The Diet That Survives Real Life",
      "Reverse Your Bloodwork in 90 Days",
    ],
    keywords: ["nutrition marketing", "dietitian ads", "meal plan copy", "health coach"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "wedding-planner",
    niche: "weddings",
    title: "Wedding Planner Marketing Hooks",
    metaDescription: "Marketing hooks for wedding planners and venues — booking campaigns, vendor outreach, and gallery growth.",
    intro: "Weddings are emotional and time-pressured. These hooks hit the stress point and the dream outcome at once.",
    hooks: [
      "Plan a ₹30L Wedding Without the Meltdown",
      "Your Dream Venue Is Free in October",
      "Weddings That Feel Like You, Not a Template",
      "Say Yes to the Planner, Not the Stress",
    ],
    keywords: ["wedding marketing", "wedding planner ads", "venue copy", "event marketing"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "legal-services",
    niche: "legal",
    title: "Law Firm Marketing Hooks",
    metaDescription: "Authority hooks for lawyers and law firms — consultation ads, case SEO titles, and trust-building copy.",
    intro: "Legal buyers are stressed and skeptical. These hooks build trust fast with outcomes, limits, and clear next steps.",
    hooks: [
      "Free 15-Minute Case Review — No Strings",
      "The Divorce Lawyer Who Answers on the 2nd Ring",
      "Accident? Settled ₹25L in 6 Months",
      "5-Star Rating. 200+ Cases Won.",
    ],
    keywords: ["law firm marketing", "lawyer ad copy", "legal SEO", "consultation ads"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "home-services",
    niche: "home services",
    title: "Home Services Marketing Hooks",
    metaDescription: "Local-service hooks for plumbers, electricians, and repair pros — same-day service ads and review-boosting copy.",
    intro: "Local services win on speed and trust. These hooks promise same-day help and name the exact job customers need done.",
    hooks: [
      "Leak? Fixed Today, Guaranteed",
      "Same-Day Electricians — 4.9★ from 800 Homes",
      "No Surprise Invoices, Ever",
      "Heaters Checked in Under an Hour",
    ],
    keywords: ["home services marketing", "plumber ads", "electrician copy", "local SEO"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "personal-brand",
    niche: "personal brand",
    title: "Personal Brand Marketing Hooks",
    metaDescription: "Hooks for founders, creators, and coaches building a personal brand — LinkedIn hooks, bio lines, and content angles.",
    intro: "Personal brands win on the specific story nobody else can tell. These hooks put the founder's proof front and center.",
    hooks: [
      "I Left a ₹40L Job to Sell ₹40 Envelopes",
      "The 3AM Idea That Built My Agency",
      "Nobody Hires Generalists — Here's My Niche",
      "From 0 to 50k Followers: The Exact Playbook",
    ],
    keywords: ["personal brand hooks", "LinkedIn hooks", "creator marketing", "founder story"],
    toolSlug: "blog-h1-generator",
  },
  {
    slug: "beauty-skincare",
    niche: "beauty & skincare",
    title: "Beauty & Skincare Marketing Hooks",
    metaDescription: "Conversion hooks for beauty and skincare brands — serum launches, ingredient-led ads, and glow-up campaigns.",
    intro: "Skincare sells on transformation and science. These hooks pair visible results with the ingredient credibility buyers want.",
    hooks: [
      "The Serum Estheticians Can't Stop Buying",
      "Visible Glow in 14 Days or Your Money Back",
      "Niacinamide 10% — Without the Pilling",
      "Skin That Doesn't Need a Filter",
    ],
    keywords: ["skincare marketing", "beauty ads", "serum launch copy", "cosmetics headlines"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "travel-tourism",
    niche: "travel",
    title: "Travel & Tourism Marketing Hooks",
    metaDescription: "Wanderlust-driving hooks for travel brands — trip packages, early-bird fares, and destination email campaigns.",
    intro: "Travel sells dreams first, logistics second. These hooks sell the moment before the itinerary.",
    hooks: [
      "The Beach You'll Never Want to Leave",
      "Early-Bird Fare Ends Sunday — Bali, ₹42k",
      "7 Days in Vietnam for Less Than Rent",
      "See Kyoto When It's Actually Quiet",
    ],
    keywords: ["travel marketing", "tourism ads", "flight deals copy", "destination campaigns"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "pet-care",
    niche: "pet care",
    title: "Pet Care Marketing Hooks",
    metaDescription: "Marketing hooks for pet brands and clinics — grooming offers, vet services, and pet product campaigns.",
    intro: "Pet owners buy with their hearts. These hooks speak to the owner's love and the pet's comfort at once.",
    hooks: [
      "Your Dog Deserves Better Than a 5-Day Wait",
      "The Vet Your Cat Won't Hide From",
      "Grooming That Leaves a Happy, Tired Pup",
      "Senior Pet Care That Prioritizes Comfort",
    ],
    keywords: ["pet care marketing", "vet ads", "dog grooming copy", "pet products"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "accounting-bookkeeping",
    niche: "accounting",
    title: "Accounting & Bookkeeping Marketing Hooks",
    metaDescription: "Trust-building hooks for accountants and bookkeepers — tax season ads, retainer offers, and compliance copy.",
    intro: "Accountants win on relief and accuracy. These hooks promise fewer headaches and zero surprises at tax time.",
    hooks: [
      "Tax Day Without the Panic",
      "Your Books, Done by Friday — Guaranteed",
      "The Accountant Who Calls Back",
      "Save ₹40k+ With Legal Deductions You're Missing",
    ],
    keywords: ["accounting marketing", "bookkeeping ads", "tax season copy", "CPA hooks"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "youtube-creator",
    niche: "YouTube",
    title: "YouTube Creator Marketing Hooks",
    metaDescription: "CTR-optimized YouTube titles for creators — hook titles, thumbnail copy, and audience-retention angles.",
    intro: "YouTube lives and dies on the first impression. These titles use specificity, stakes, and curiosity to earn the click.",
    hooks: [
      "Why I Quit Posting Daily (And Got 3x Views)",
      "The Editing Secret Big Creators Won't Share",
      "I Made ₹1L With 10k Subscribers",
      "This Title Algorithm Trick Doubled My CTR",
    ],
    keywords: ["YouTube title hooks", "creator marketing", "CTR optimization", "video titles"],
    toolSlug: "youtube-title-generator",
  },
  {
    slug: "mobile-app",
    niche: "mobile apps",
    title: "Mobile App Marketing Hooks",
    metaDescription: "Install-driving hooks for mobile apps — app store titles, push notification copy, and UA campaign angles.",
    intro: "Apps need a hook in one glance. These lines sell the outcome in the 5 seconds a user decides whether to install.",
    hooks: [
      "Your Step Count, Finally Beaten",
      "The Habit Tracker That Doesn't Nag You",
      "One App. Every Budget. In ₹.",
      "Less Screen Time in 3 Days",
    ],
    keywords: ["app marketing hooks", "app store titles", "push notification copy", "user acquisition"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "insurance",
    niche: "insurance",
    title: "Insurance Marketing Hooks",
    metaDescription: "Compliance-safe hooks for insurance brands — policy ads, family coverage campaigns, and claim-trust copy.",
    intro: "Insurance sells protection against the future. These hooks stay compliant while making the risk feel immediate.",
    hooks: [
      "Premium from ₹499/month. Your Family's Covered.",
      "The Claim They Actually Approved in 48 Hours",
      "Health Cover That Doesn't Shrink at 40",
      "Term Insurance for the Breadwinner",
    ],
    keywords: ["insurance marketing", "policy ads", "health insurance copy", "claim trust"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "coaching-mindset",
    niche: "coaching",
    title: "Life & Business Coaching Marketing Hooks",
    metaDescription: "High-ticket hooks for life and business coaches — discovery call ads, group program launches, and transformation copy.",
    intro: "Coaching sells transformation and accountability. These hooks name the identity shift the client actually wants.",
    hooks: [
      "From Overwhelmed to Over-Organized in 8 Weeks",
      "The 1-on-1 Coach for 6-Figure Agency Owners",
      "Stop Sabotaging Your Own Success",
      "Your Calendar Is Full. Your Pipeline Isn't.",
    ],
    keywords: ["coaching marketing", "life coach ads", "business coaching copy", "discovery calls"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "restaurant-food",
    niche: "restaurants",
    title: "Restaurant & Food Marketing Hooks",
    metaDescription: "Appetite-driving hooks for restaurants and food brands — delivery ads, new menu launches, and chef-story copy.",
    intro: "Food ads win on appetite and FOMO. These hooks make the dish the hero and the special impossible to skip.",
    hooks: [
      "The Biryani Everyone in Your Office Orders",
      "New Menu: 12 Dishes We're Obsessed With",
      "Free Dessert With Every Order This Weekend",
      "Chef's Special — Only 20 Orders a Night",
    ],
    keywords: ["restaurant marketing", "food ads", "delivery copy", "menu launch hooks"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "saas-b2b-sales",
    niche: "B2B sales",
    title: "B2B Sales Outreach Hooks",
    metaDescription: "Reply-earning hooks for B2B sales — cold email subject lines, LinkedIn outreach, and SDR sequences.",
    intro: "B2B buyers are bombarded. These hooks survive the inbox by being specific, human, and about their business — not yours.",
    hooks: [
      "Quick one for your Q3 pipeline…",
      "We cut onboarding from 40 days to 6 for [competitor]",
      "Your sales team is spending 3h/day on data entry",
      "RE: the CFO webinar — one idea for your follow-up",
    ],
    keywords: ["B2B sales hooks", "cold email subjects", "LinkedIn outreach", "SDR sequences"],
    toolSlug: "email-subject-line-generator",
  },
  {
    slug: "language-learning",
    niche: "language learning",
    title: "Language Learning Marketing Hooks",
    metaDescription: "Motivation hooks for language apps and tutors — fluency promises, 15-minute lessons, and immersion campaigns.",
    intro: "Language learners want fluency but fear the grind. These hooks make progress feel small, daily, and inevitable.",
    hooks: [
      "Speak Spanish in 90 Days — 15 Min/Day",
      "Fluency Without Memorizing Verb Tables",
      "The App That Talks Back to You",
      "Learn Like a Kid: Input, Not Homework",
    ],
    keywords: ["language learning ads", "fluency hooks", "tutoring marketing", "language app copy"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "kids-parenting",
    niche: "parenting",
    title: "Parenting & Kids Marketing Hooks",
    metaDescription: "Empathetic hooks for parenting brands — kids' products, activities, and parenting courses that build trust.",
    intro: "Parents buy out of love and exhaustion. These hooks honor both — helping the child and easing the parent's load.",
    hooks: [
      "Tantrum-Proof Mornings in 7 Days",
      "The Toy That Actually Occupies Them (We Tested)",
      "Activities That End Screen-Time Fights",
      "Your Kid Is Ready for the School They Deserve",
    ],
    keywords: ["parenting marketing", "kids products ads", "parenting courses", "family brands"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "photography",
    niche: "photography",
    title: "Photography Business Marketing Hooks",
    metaDescription: "Booking hooks for photographers — wedding packages, family sessions, and portrait shoot campaigns.",
    intro: "Photographers sell memories and the fear of missing them. These hooks make the milestone feel urgent and beautiful.",
    hooks: [
      "The Photos Your Kids Will Ask to See at 40",
      "Wedding Packages From ₹25k — 2 Dates Left",
      "Book Before the Autumn Light Is Gone",
      "Portraits That Don't Feel Posed",
    ],
    keywords: ["photography marketing", "photographer ads", "wedding photography copy", "family sessions"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "mental-health",
    niche: "mental health",
    title: "Mental Health & Therapy Marketing Hooks",
    metaDescription: "Empathetic hooks for therapists and wellness apps — therapy ads, self-care campaigns, and destigmatizing copy.",
    intro: "Mental-health copy must be warm, never shaming. These hooks meet readers where they are and open a door, not a pitch.",
    hooks: [
      "Therapy That Fits Into Your Lunch Break",
      "It's Okay That You're Not Okay Today",
      "Signs You're Burning Out (and What Actually Helps)",
      "Talk to Someone Who Gets It — Online",
    ],
    keywords: ["therapy marketing", "mental health ads", "wellness apps", "therapist copy"],
    toolSlug: "blog-h1-generator",
  },
  {
    slug: "events-webinar",
    niche: "events & webinars",
    title: "Events & Webinar Marketing Hooks",
    metaDescription: "Register-driving hooks for webinars and events — invite emails, early-bird tickets, and speaker-led campaigns.",
    intro: "Event signups need urgency plus a clear payoff. These hooks sell the outcome of attending, not the agenda.",
    hooks: [
      "Seats Are Filling — Today's Topic: Q3 Budgets",
      "Live: The SEO Playbook That Got 2x Traffic",
      "Early-Bird Ends Tonight (Save ₹2,000)",
      "One Hour. One Framework. No Fluff.",
    ],
    keywords: ["webinar marketing", "event email hooks", "early bird tickets", "registration copy"],
    toolSlug: "email-subject-line-generator",
  },
  {
    slug: "real-estate-luxury",
    niche: "luxury real estate",
    title: "Luxury Real Estate Marketing Hooks",
    metaDescription: "High-end hooks for luxury real estate — exclusive listings, gated communities, and premium buyer outreach.",
    intro: "Luxury buyers respond to scarcity and status. These hooks whisper exclusivity instead of shouting price.",
    hooks: [
      "Not on the Market — Yet",
      "The Penthouse With the 360° Skyline",
      "Listed Friday. 3 Private Showings Only.",
      "For the Buyer Who's Seen It All",
    ],
    keywords: ["luxury real estate", "premium listings", "exclusive properties", "high-end marketing"],
    toolSlug: "ad-hook-generator",
  },
  {
    slug: "email-newsletter",
    niche: "newsletters",
    title: "Newsletter Growth Marketing Hooks",
    metaDescription: "Subscribe-driving hooks for newsletters — welcome email copy, social promos, and referral incentives.",
    intro: "A newsletter grows on one promise: what the reader gets, and why it's worth opening every time.",
    hooks: [
      "The 5-Minute Brief That Makes You Look Smart",
      "Every Sunday. One Big Idea. Zero Fluff.",
      "Join 20,000 Marketers Who Read Less, Decide Faster",
      "Your Weekly Dose of Unconventional Strategy",
    ],
    keywords: ["newsletter growth", "subscribe hooks", "welcome email copy", "newsletter promotion"],
    toolSlug: "email-subject-line-generator",
  },
  {
    slug: "career-remote-work",
    niche: "career coaching",
    title: "Career & Remote Work Marketing Hooks",
    metaDescription: "Hooks for career coaches and remote-job platforms — resume services, job hunt campaigns, and salary negotiation.",
    intro: "Career buyers want the offer, not advice. These hooks promise the outcome — interviews, offers, and the raise.",
    hooks: [
      "Your Resume Is Getting Filtered. Here's the Fix.",
      "Interview-Proof in 2 Weeks",
      "Remote Jobs Paying ₹30L+ (Curated Daily)",
      "Negotiate ₹5L More Without Feeling Awkward",
    ],
    keywords: ["career coaching", "resume marketing", "remote jobs", "salary negotiation"],
    toolSlug: "email-subject-line-generator",
  },
  {
    slug: "home-decor",
    niche: "home decor",
    title: "Home Decor & Furniture Marketing Hooks",
    metaDescription: "Interior-worthy hooks for decor and furniture brands — collection launches, seasonal sales, and room inspiration.",
    intro: "Home decor sells identity and comfort. These hooks show the room the buyer wants before they see the product.",
    hooks: [
      "Your Living Room Is One Shelf Away",
      "The Chair Designers Recommend (And Sell Out)",
      "Fall Collection: Warmth Without the Clutter",
      "Rooms That Feel Expensive (For Less)",
    ],
    keywords: ["home decor marketing", "furniture ads", "interior copy", "seasonal sales"],
    toolSlug: "ad-hook-generator",
  },
];

export function getTemplate(slug: string): Template | undefined {
  return templates.find((t) => t.slug === slug);
}

export type FaqItem = { question: string; answer: string };

// Programmatic FAQ so every template page gets unique, niche-specific
// content plus FAQPage schema (drives rich results in Google).
export function templateFaq(t: Template): FaqItem[] {
  return [
    {
      question: `What are the best ${t.niche} marketing hooks?`,
      answer: `The best ${t.niche} marketing hooks lead with a specific outcome or audience instead of a generic announcement. Examples from our ${t.title} list: "${t.hooks[0]}" and "${t.hooks[1]}". Both name the result the reader wants, which is what earns the click and the reply.`,
    },
    {
      question: `How do I write a hook for a ${t.niche} brand?`,
      answer: `Start with the audience plus the outcome: who you help and what changes for them. Pick one concrete benefit, cut every word that doesn't serve it, and test the result with a CTR-scored generator. We have a free one built into this site that returns scored options for your exact product.`,
    },
    {
      question: `What makes a ${t.niche} ad headline convert?`,
      answer: `Three things: specificity (real numbers and timeframes), a psychological trigger (curiosity, loss aversion, or transformation), and the right channel. A headline that works as an ad may flop as an email subject, so match the format. Our ${t.niche} examples above are grouped by where they're meant to run.`,
    },
    {
      question: `Where can I get more ${t.niche} hook ideas for free?`,
      answer: `Use the free ${t.niche} generator on this site — type your topic once and it returns several scored hooks you can copy. You also get ${t.hooks.length} ready-to-adapt examples on this page and a fresh daily allowance to test as many angles as you need.`,
    },
  ];
}