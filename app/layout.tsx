import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import CookieConsent from "@/components/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hook AI — The Angle Discovery Engine for Marketers",
  description:
    "Generate CTR-predicted ad headlines, email subjects, and YouTube titles. Find the psychological angles your competitors are missing. Free AI-powered marketing tool.",
  keywords: [
    "marketing hooks",
    "ad headline generator",
    "email subject line generator",
    "AI marketing tool",
    "copywriting angles",
    "competitor analysis",
    "CTR prediction",
  ],
  metadataBase: new URL("https://hook-ai-marketing-engine.vercel.app"),
  openGraph: {
    title: "Hook AI — The Angle Discovery Engine for Marketers",
    description:
      "Find the psychological angles your competitors are missing, get CTR-predicted headlines, and a USP in seconds.",
    type: "website",
    url: "https://hook-ai-marketing-engine.vercel.app",
    siteName: "Hook AI",
    images: [{ url: "/og/home", width: 1200, height: 630, alt: "Hook AI — Stop writing headlines. Start winning angles." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hook AI — The Angle Discovery Engine for Marketers",
    description:
      "Find the psychological angles your competitors are missing, get CTR-predicted headlines, and a USP in seconds.",
    images: ["/og/home"],
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#4f46e5" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Hook AI",
              url: "https://hook-ai-marketing-engine.vercel.app",
              description:
                "AI-powered marketing hook and angle discovery engine. Generates CTR-predicted ad headlines, email subjects, and YouTube titles.",
              applicationCategory: "BusinessApplication",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <NavBar />
          {children}
          <Footer />
          <CookieConsent />
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) { console.log('SW registered:', reg.scope); },
                    function(err) { console.log('SW registration failed:', err); }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}