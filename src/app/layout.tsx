import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  metadataBase: new URL("https://applypilot.us"),
  title: {
    default: "ApplyPilot — Never Miss Your Dream Job Again",
    template: "%s | ApplyPilot",
  },
  description:
    "AI-powered job application automation. While you sleep, AI applies to hundreds of jobs for you. Get more interviews in days, not weeks.",
  keywords: [
    "AI job application",
    "automated job applications",
    "job search automation",
    "AI resume builder",
    "cover letter generator",
    "ATS resume optimizer",
    "job matching AI",
    "career automation",
    "auto apply jobs",
  ],
  authors: [{ name: "ApplyPilot" }],
  creator: "ApplyPilot",
  publisher: "ApplyPilot",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://applypilot.us",
    siteName: "ApplyPilot",
    title: "ApplyPilot — Never Miss Your Dream Job Again",
    description:
      "AI-powered job application automation. While you sleep, AI applies to hundreds of jobs for you.",
    images: [
      {
        url: "/logo.png",
        width: 1000,
        height: 1000,
        alt: "ApplyPilot Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ApplyPilot — Never Miss Your Dream Job Again",
    description:
      "AI-powered job application automation. While you sleep, AI applies to hundreds of jobs for you.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="canonical" href="https://applypilot.us" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "ApplyPilot",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description:
                "AI-powered job application automation — applies to hundreds of jobs while you sleep.",
              url: "https://applypilot.us",
              offers: [
                {
                  "@type": "Offer",
                  name: "Starter",
                  price: "35.00",
                  priceCurrency: "USD",
                },
                {
                  "@type": "Offer",
                  name: "Pro",
                  price: "79.00",
                  priceCurrency: "USD",
                },
                {
                  "@type": "Offer",
                  name: "Elite",
                  price: "149.00",
                  priceCurrency: "USD",
                },
              ],
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                ratingCount: "10000",
              },
            }),
          }}
        />
      </head>
      <body className="antialiased bg-white text-surface-950">
        <GoogleAnalytics />
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CookieConsent />
        </SessionProvider>
      </body>
    </html>
  );
}
