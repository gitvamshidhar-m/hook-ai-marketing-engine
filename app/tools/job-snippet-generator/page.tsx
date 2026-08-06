import type { Metadata } from "next";
import JobSnippetGenerator from "@/components/JobSnippetGenerator";

export const metadata: Metadata = {
  title: "Job Posting Snippet Generator · Hook AI",
  description:
    "Turn any job posting into a ranking landing page: CTR-ready meta description plus JobPosting and FAQ structured data you can paste directly into your careers page.",
  alternates: { canonical: "https://hook-ai-marketing-engine.vercel.app/tools/job-snippet-generator" },
  openGraph: {
    title: "Job Posting Snippet Generator · Hook AI",
    description: "Meta descriptions and JobPosting/FAQ schema for job postings that rank.",
    type: "website",
    url: "https://hook-ai-marketing-engine.vercel.app/tools/job-snippet-generator",
    siteName: "Hook AI",
  },
};

export default function JobSnippetPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Job Posting Snippet Generator</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Job postings are landing pages. Generate a click-worthy meta description and the structured data Google uses
          for rich results — ready to paste into your careers page.
        </p>
        <div className="mt-8">
          <JobSnippetGenerator />
        </div>
      </div>
    </main>
  );
}