export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  metaDescription: string;
  tags: string[];
  body: string[];
  faq: { question: string; answer: string }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "job-ad-hook-examples-that-get-more-applications",
    title: "12 Job Ad Hook Examples That Get More Applications",
    date: "2026-01-15",
    excerpt:
      "Recruiters lose candidates in the first line. Here are 12 proven job ad hook formulas plus free tools to write your own in seconds.",
    metaDescription:
      "Stuck at 'We are hiring!'? These 12 job ad hook examples show recruiters how to write openings that actually get applications, with a free generator to speed it up.",
    tags: ["recruiting", "copywriting", "job ads"],
    body: [
      "Most job posts open with 'We are hiring!' — and most candidates scroll straight past. The first line of your job ad is your single best chance to earn the click, and it's also the first thing search engines use to decide if your posting is relevant.",
      "The strongest recruiting hooks borrow from performance marketing: lead with the outcome, the audience, or the curiosity gap. Instead of a generic 'Looking for a Content Marketer' line, try 'The Content Marketer Who Gets 100k Views'. That one line targets both the role and the ambition.",
      "Use the free Ad Headline Generator below to test your own hook against CTR-prediction scoring. Type your role, pick the 'ad' channel, and copy the top result straight into your posting.",
      "A practical formula that works across industries: [Audience] who [outcome]. 'A Recruiter who screens 10x faster.' 'An SDR who books demos on autopilot.' Specific beats clever almost every time — specificity is what search engines and humans both reward.",
    ],
    faq: [
      {
        question: "What is a hook in a job ad?",
        answer: "A hook is the first line of your job ad — the one sentence that earns the click or the application. It leads with the outcome or audience ('The Content Marketer Who Gets 100k Views') instead of a generic 'We are hiring!'.",
      },
      {
        question: "How long should a job ad hook be?",
        answer: "Keep it to one line — roughly 6 to 10 words. The hook's job is to stop the scroll; the details belong below the fold. Short, specific, outcome-led hooks consistently outperform longer openings.",
      },
      {
        question: "Can I generate job ad hooks for free?",
        answer: "Yes. The free Ad Headline Generator on this site scores your role-based hooks by predicted CTR, and the Job Snippet Generator produces a click-worthy meta description plus JobPosting and FAQ schema in one go.",
      },
    ],
  },
  {
    slug: "best-ai-tools-for-recruiters-2026",
    title: "The Best AI Tools for Recruiters in 2026 (Tested)",
    date: "2026-02-02",
    excerpt:
      "From screening to job ad copy, here are the AI tools that actually save recruiters time — including the free generator built into this site.",
    metaDescription:
      "A practical, tested roundup of AI tools that help recruiters screen faster, write better job ads, and fill roles sooner — with the ones you can start free today.",
    tags: ["recruiting", "AI tools", "roundup"],
    body: [
      "Recruiting is drowning in unreadable resumes and cookie-cutter job posts. The AI tools that win in 2026 are the ones that do one job extremely well instead of promising everything.",
      "For screening, resume parsers and skill-matching models cut the first pass from hours to minutes. For outreach, sequence tools with AI personalization lift reply rates. For the part most recruiters forget — the job ad itself — hook and headline generators remove the blank-page problem.",
      "Hook AI's free generators are built for exactly that: type your role and get CTR-scored headlines, email subjects, and ad hooks in seconds. There's no setup and no credit card, and anonymous users get a daily allowance to test before signing up.",
      "The meta-lesson: don't buy a tool to do your thinking. Buy tools that compress the mechanical parts — writing, summarizing, matching — so your human judgment has more time where it matters.",
    ],
    faq: [
      {
        question: "What AI tools do recruiters actually use in 2026?",
        answer: "The ones that do one job extremely well: resume parsers and skill matchers for screening, sequence tools with AI personalization for outreach, and hook or headline generators for the job ad itself.",
      },
      {
        question: "Are there free AI recruiting tools?",
        answer: "Yes — Hook AI's generators (ad hooks, email subjects, YouTube titles) are free with a daily allowance that resets each morning, and anonymous users get bonus runs when they verify their email.",
      },
      {
        question: "Should AI replace a recruiter's judgment?",
        answer: "No. Use AI to compress the mechanical parts — writing, summarizing, matching — so your human judgment has more time for the decisions that matter: who to trust, how to negotiate, and how to close.",
      },
    ],
  },
  {
    slug: "how-to-rank-job-posting-in-google",
    title: "How to Rank a Job Posting in Google Search",
    date: "2026-02-20",
    excerpt:
      "Your job posting is a landing page. Here's how to treat it like one: title hooks, structured data, and the exact schema that gets rich results.",
    metaDescription:
      "Treat job postings like landing pages. Learn title hooks, JobPosting structured data, and FAQ schema to get your openings ranking in Google and showing rich results.",
    tags: ["SEO", "job postings", "structured data"],
    body: [
      "A job posting is a landing page with a conversion goal: qualified applicants. Like any landing page it needs a compelling title, clear structure, and the right signals for search engines to trust and surface it.",
      "Start with the hook. The <title> and H1 should name the role AND the outcome ('Remote Content Marketer — 100k-View Creator'). That's the same CTR logic behind our ad and YouTube title generators.",
      "Then add structured data. Use JobPosting JSON-LD schema so Google can show salary, location, and posting date in rich results. Wrap the 'About this role' section in FAQPage schema to earn an expanded result.",
      "The free Job Snippet Generator on this site produces this exact schema — a JobPosting description, a click-worthy meta description, and FAQ JSON-LD — from just the role, company, and location. Paste it into your posting or career page and watch the structured snippets appear.",
    ],
    faq: [
      {
        question: "How do I get a job posting to rank in Google?",
        answer: "Treat it like a landing page: a hook-led title and H1 that name the role and the outcome, clean structure, and JobPosting structured data so Google can show salary, location, and posting date in rich results.",
      },
      {
        question: "What is JobPosting structured data?",
        answer: "JobPosting is JSON-LD schema that tells Google how to display a job opening in search — including compensation, location, and posting date. Wrapping your 'About this role' section in FAQPage schema earns an expanded result too.",
      },
      {
        question: "Does Hook AI generate job posting schema?",
        answer: "Yes. The free Job Snippet Generator produces a JobPosting description, a meta description, and FAQ JSON-LD from just the role, company, and location.",
      },
    ],
  },
  {
    slug: "psychology-of-high-converting-headlines",
    title: "The Psychology Behind High-Converting Headlines",
    date: "2026-03-05",
    excerpt:
      "Curiosity gaps, loss aversion, and the 6-word rule: the behavioral science that makes some headlines impossible to ignore.",
    metaDescription:
      "Why do some headlines get clicked and others ignored? A practical breakdown of the psychology — curiosity gaps, loss aversion, specificity — that powers high CTR copy.",
    tags: ["copywriting", "psychology", "CTR"],
    body: [
      "Headlines are decided in a fraction of a second by the emotional centers of the brain, not the rational ones. That's why the highest-CTR copy almost always triggers one of a handful of mechanisms.",
      "The curiosity gap — presenting a partial answer — is the workhorse. 'The 10-min outreach that replies' invites the reader to fill in the missing piece. Loss aversion is the heavy hitter for urgency: 'We miss you. Here's 2x credit' trades on what the reader stands to lose.",
      "Specificity is the multiplier. Concrete numbers ('70%', '24h', '3 seats left') anchor the claim and raise trust — both in readers and in search relevance signals.",
      "Every Hook AI generator scores output against exactly these dimensions: psychological trigger, clarity, and length. Run the same prompt through each channel and you'll see the scoring shift as the format changes.",
    ],
    faq: [
      {
        question: "What makes a headline high-converting?",
        answer: "High-converting headlines trigger a psychological mechanism — usually a curiosity gap, loss aversion, or specificity — and are short enough to be processed in the fraction of a second before a reader scrolls on.",
      },
      {
        question: "What is a curiosity gap in copywriting?",
        answer: "A curiosity gap presents a partial answer so the reader wants to fill in the missing piece. 'The 10-min outreach that replies' is a classic example: it promises a result without revealing how.",
      },
      {
        question: "Why does specificity boost CTR?",
        answer: "Concrete numbers ('70%', '24h', '3 seats left') anchor your claim and raise trust — in both readers and search relevance signals. Specific beats clever almost every time.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}