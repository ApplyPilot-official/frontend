import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://applypilot.us"),
  title: {
    default: "AI Job Application Automation | ApplyPilot",
    template: "%s | ApplyPilot",
  },
  description:
    "AI-powered job application assistant that automatically finds and applies to relevant jobs for you. Save time. Get more interviews.",
  keywords: [
    "AI job application",
    "automated job applications",
    "job search automation",
    "AI resume",
    "cover letter generator",
    "job matching",
    "career automation",
  ],
  authors: [{ name: "ApplyPilot" }],
  creator: "ApplyPilot",
  publisher: "ApplyPilot",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://applypilot.us",
    siteName: "ApplyPilot",
    title: "AI Job Application Automation | ApplyPilot",
    description:
      "AI-powered job application assistant that automatically finds and applies to relevant jobs for you. Save time. Get more interviews.",
    images: [
      {
        url: "/logo.png",
        width: 500,
        height: 500,
        alt: "ApplyPilot Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Job Application Automation | ApplyPilot",
    description:
      "AI-powered job application assistant that automatically finds and applies to relevant jobs for you.",
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
                "AI-powered job application assistant that automatically finds and applies to relevant jobs for you.",
              url: "https://applypilot.us",
              offers: {
                "@type": "Offer",
                price: "35.00",
                priceCurrency: "USD",
                priceValidUntil: "2027-12-31",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "150",
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
