import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Sora } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "./providers";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cloud Native Sri Lanka (CNSL) | Empowering Tech Communities",
  description:
    "Join Sri Lanka's premier cloud-native technology community. Connect with mentors, attend meetups, and grow your tech career through CNSL Connect, University Outreach, and monthly events.",
  keywords: [
    "Cloud Native",
    "Sri Lanka",
    "CNSL",
    "Kubernetes",
    "DevOps",
    "Tech Community",
    "Mentorship",
    "CNCF",
  ],
  authors: [{ name: "Cloud Native Sri Lanka" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  icons: {
    icon: "/placeholder-logo.svg",
    shortcut: "/placeholder-logo.svg",
    apple: "/placeholder-logo.svg",
  },
  openGraph: {
    title: "Cloud Native Sri Lanka (CNSL)",
    description:
      "Empowering Sri Lanka's tech community through mentorship, education, and collaboration",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/community-gathering-people-networking.jpg",
        width: 1200,
        height: 630,
        alt: "CNSL community meetup",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cloud Native Sri Lanka (CNSL)",
    description: "Join Sri Lanka's premier cloud-native technology community",
    images: ["/community-gathering-people-networking.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Let AuthProvider handle user data client-side to allow static rendering
  // Pages that need user data server-side can opt-in to dynamic rendering individually

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`font-sans ${sora.className} ${GeistMono.variable}`}>
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <ThemeProvider
              attribute="class"
              forcedTheme="dark"
              enableSystem={false}
              storageKey="cnsl-theme"
              disableTransitionOnChange
            >
              <Suspense fallback={null}>
                <AuthProvider initialUser={null} initialRoles={[]}>
                  {children}
                  <Analytics />
                </AuthProvider>
              </Suspense>
            </ThemeProvider>
            <Script
              id="org-schema"
              type="application/ld+json"
              strategy="afterInteractive"
            >
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Cloud Native Sri Lanka (CNSL)",
                logo: "/placeholder-logo.svg",
              })}
            </Script>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
