"use client";

import { useState } from "react";
import Link from "next/link";

type Faq = { q: string; a: string };

const inputClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-indigo-900/40";

export default function JobSnippetGenerator() {
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("FULL_TIME");
  const [salary, setSalary] = useState("");
  const [bullet1, setBullet1] = useState("");
  const [bullet2, setBullet2] = useState("");
  const [bullet3, setBullet3] = useState("");
  const [faqs, setFaqs] = useState<Faq[]>([{ q: "", a: "" }]);
  const [copied, setCopied] = useState<"" | "desc" | "ld">("");

  const metaDescription = `${role.trim() || "Join us"} at ${company.trim() || "our company"}${location.trim() ? ` in ${location.trim()}` : ""} — apply today. ${bullet1.trim() || "Competitive pay"}. ${bullet2.trim() || "Great team"}. ${bullet3.trim() || "Real growth"}.`;

  const jobPostingLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: role.trim(),
    description: bullet1.trim() || "",
    datePosted: new Date().toISOString().slice(0, 10),
    employmentType: type,
    hiringOrganization: { "@type": "Organization", name: company.trim() },
    jobLocation: location.trim() ? { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: location.trim() } } : undefined,
    ...(salary.trim()
      ? { baseSalary: { "@type": "MonetaryAmount", value: { "@type": "QuantitativeValue", value: salary.trim(), unitText: "MONTH" } } }
      : {}),
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.filter((f) => f.q.trim() && f.a.trim()).map((f) => ({
      "@type": "Question",
      name: f.q.trim(),
      acceptedAnswer: { "@type": "Answer", text: f.a.trim() },
    })),
  };

  function copyDesc() {
    navigator.clipboard.writeText(metaDescription).then(() => {
      setCopied("desc");
      setTimeout(() => setCopied(""), 2000);
    }).catch(() => {});
  }

  function copyLd() {
    const json = JSON.stringify([jobPostingLd, ...(faqs.some((f) => f.q.trim()) ? [faqLd] : [])], null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setCopied("ld");
      setTimeout(() => setCopied(""), 2000);
    }).catch(() => {});
  }

  function setFaq(i: number, patch: Partial<Faq>) {
    setFaqs((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }

  const serpInputClass =
    "mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900";

  return (
    <div className="space-y-8">
      <div className="card-elevated rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Job title</label>
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Content Marketer" maxLength={80} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Company</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." maxLength={80} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote · India" maxLength={80} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Employment type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
              <option value="FULL_TIME">Full-time</option>
              <option value="PART_TIME">Part-time</option>
              <option value="CONTRACTOR">Contract</option>
              <option value="INTERN">Internship</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Monthly salary (optional)</label>
            <input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="80000" inputMode="numeric" className={inputClass} />
          </div>
        </div>

        <p className="mb-1.5 mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-500">Top 3 selling points</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <input value={bullet1} onChange={(e) => setBullet1(e.target.value)} placeholder="Competitive pay" maxLength={60} className={inputClass} />
          <input value={bullet2} onChange={(e) => setBullet2(e.target.value)} placeholder="Great team" maxLength={60} className={inputClass} />
          <input value={bullet3} onChange={(e) => setBullet3(e.target.value)} placeholder="Real growth" maxLength={60} className={inputClass} />
        </div>

        <p className="mb-1.5 mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-500">FAQ (drives rich results)</p>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-2">
              <input value={f.q} onChange={(e) => setFaq(i, { q: e.target.value })} placeholder="Q: What does the hiring process look like?" maxLength={120} className={inputClass} />
              <input value={f.a} onChange={(e) => setFaq(i, { a: e.target.value })} placeholder="A: Short answer…" maxLength={200} className={inputClass} />
            </div>
          ))}
          {faqs.length < 4 && (
            <button
              type="button"
              onClick={() => setFaqs((prev) => [...prev, { q: "", a: "" }])}
              className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              + Add another FAQ
            </button>
          )}
        </div>
      </div>

      <div className={serpInputClass}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">SERP preview</h2>
        <div className="mt-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
          <p className="text-xs text-zinc-400">jobs.{company.trim().toLowerCase().replace(/\s+/g, "") || "acme"}.com</p>
          <p className="mt-1 text-xl font-medium leading-snug text-[#1a0dab] dark:text-indigo-300">
            {role.trim() ? `Hiring ${role.trim()} — Apply Now` : "Hiring [Role] — Apply Now"}
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{metaDescription}</p>
        </div>
        <button
          onClick={copyDesc}
          className="mt-4 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          {copied === "desc" ? "Copied!" : "Copy meta description"}
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Structured data (JSON-LD)</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Paste into your careers page <code>&lt;head&gt;</code>. Includes <code>JobPosting</code> schema
          {faqs.some((f) => f.q.trim()) ? " and FAQ schema" : ""} for rich results.
        </p>
        <pre className="mt-4 max-h-72 overflow-auto rounded-xl bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-200">
{JSON.stringify([jobPostingLd, ...(faqs.some((f) => f.q.trim()) ? [faqLd] : [])], null, 2)}
        </pre>
        <button
          onClick={copyLd}
          className="bg-gradient-brand mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
        >
          {copied === "ld" ? "Copied!" : "Copy structured data"}
        </button>
      </div>

      <div className="rounded-2xl border border-indigo-200 bg-gradient-soft p-6 dark:border-indigo-900 dark:bg-indigo-950/30">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Next step</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Pair your structured snippet with a CTR-winning job ad hook from the free generator.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/tools/ad-hook-generator"
            className="bg-gradient-brand rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
          >
            Ad Headline Generator
          </Link>
          <Link href="/tools/email-subject-line-generator" className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800">
            Email Subject Generator
          </Link>
        </div>
      </div>
    </div>
  );
}