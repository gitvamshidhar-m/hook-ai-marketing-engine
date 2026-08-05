import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://hook-ai-marketing-engine.vercel.app";
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/community`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/campaigns`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/analytics`, changeFrequency: "weekly", priority: 0.5 },
  ];
}
