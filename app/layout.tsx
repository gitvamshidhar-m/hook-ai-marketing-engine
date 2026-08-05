import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { AuthProvider } from "@/components/AuthProvider";

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
    "Find the psychological angles your competitors are missing, get CTR-predicted headlines, and a USP in seconds. Free, AI-powered, no signup.",
  metadataBase: new URL("https://hook-ai-marketing-engine.vercel.app"),
  openGraph: {
    title: "Hook AI — The Angle Discovery Engine for Marketers",
    description:
      "Find the psychological angles your competitors are missing, get CTR-predicted headlines, and a USP in seconds.",
    type: "website",
    url: "https://hook-ai-marketing-engine.vercel.app",
    siteName: "Hook AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hook AI — The Angle Discovery Engine for Marketers",
    description:
      "Find the psychological angles your competitors are missing, get CTR-predicted headlines, and a USP in seconds.",
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
      </head>
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <NavBar />
          {children}
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