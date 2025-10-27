import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";

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
  return (
    <div className={sora.className}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>
      {children}
    </div>
  );
}
