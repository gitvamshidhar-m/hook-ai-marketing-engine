import type { MetadataRoute } from "next";
import { tools } from "@/lib/seo/tools";
import { templates } from "@/lib/seo/templates";
import { blogPosts } from "@/lib/seo/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://hook-ai-marketing-engine.vercel.app";
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tools`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/templates`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/learn`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/job-snippet-generator`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/tools/ad-preview`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/community`, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/campaigns`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/analytics`, changeFrequency: "weekly", priority: 0.5 },
    ...tools.map((t) => ({
      url: `${base}/tools/${t.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...templates.map((t) => ({
      url: `${base}/templates/${t.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...blogPosts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      lastModified: p.date,
    })),
  ];
  return entries;
}