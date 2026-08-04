"use client";

type Template = {
  label: string;
  icon: string;
  topic: string;
  audience: string;
  goal: string;
  competitors: string;
  voice: string;
  language: string;
};

const TEMPLATES: Template[] = [
  {
    label: "SaaS signup",
    icon: "🖥️",
    topic: "project management software",
    audience: "busy founders and small teams",
    goal: "drive free trial signups",
    competitors: "Why your team is slow\n10 productivity hacks nobody uses",
    voice: "We cut the busywork so teams ship faster.",
    language: "en",
  },
  {
    label: "DTC offer",
    icon: "🛍️",
    topic: "organic skincare",
    audience: "busy moms",
    goal: "drive signups to a free email course",
    competitors: "Why your skincare routine isnt working\n10 anti-aging secrets dermatologists hate",
    voice: "We make healthy easy for busy families.",
    language: "en",
  },
  {
    label: "Online course",
    icon: "🎓",
    topic: "learn to code in 90 days",
    audience: "career switchers 25-40",
    goal: "drive course enrollments",
    competitors: "10 best coding courses for beginners\nWhy self-taught developers fail",
    voice: "Practical skills, zero fluff, real projects.",
    language: "en",
  },
  {
    label: "Local service",
    icon: "📍",
    topic: "emergency plumbing",
    audience: "homeowners",
    goal: "drive phone calls for same-day repair",
    competitors: "5 signs you need a plumber\nWhy your pipes keep bursting",
    voice: "We show up fast and fix it right.",
    language: "en",
  },
  {
    label: "Fitness brand",
    icon: "💪",
    topic: "home workouts",
    audience: "time-crunched professionals",
    goal: "drive app downloads",
    competitors: "10 exercises you are doing wrong\nWhy home workouts fail",
    voice: "Sweat smarter in 20 minutes.",
    language: "en",
  },
  {
    label: "Saas product",
    icon: "📧",
    topic: "email marketing automation",
    audience: "ecommerce store owners",
    goal: "drive free trial signups",
    competitors: "Why your emails get ignored\n5 email flows every store needs",
    voice: "Send once, sell on autopilot.",
    language: "en",
  },
];

export default function TemplateGallery({
  onLoad,
}: {
  onLoad: (v: { topic: string; audience: string; goal: string; competitors: string; voice: string; language: string }) => void;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Don&apos;t know where to start? Try a template:
        </p>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.label}
            onClick={() =>
              onLoad({
                topic: t.topic,
                audience: t.audience,
                goal: t.goal,
                competitors: t.competitors,
                voice: t.voice,
                language: t.language,
              })
            }
            className="flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300"
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}