import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Noto_Sans_Tamil } from "next/font/google";
import Script from "next/script";
import AppShell from "../components/AppShell";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const notoSansTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-noto-sans-tamil"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mcqpalagu.in"),
  title: {
    default: "MCQ Palagu | Free TNPSC Group 4 Practice Tests in Tamil & English",
    template: "%s | MCQ Palagu"
  },
  description: "Free MCQ practice for TNPSC Group 4, Group 2, TET & TNUSRB. Samacheer Kalvi Class 6–10 questions in Tamil & English. 6400+ questions. Start free — no login needed.",
  keywords: [
    "TNPSC Group 4 MCQ",
    "TNPSC practice test",
    "Samacheer MCQ questions",
    "TNPSC free mock test",
    "Group 4 tamil questions",
    "TNPSC Group 2 practice",
    "TET MCQ practice",
    "TNUSRB practice test",
    "மாதிரி வினாக்கள்",
    "TNPSC தேர்வு பயிற்சி",
    "Samacheer kalvi questions tamil",
    "MCQ பழகு"
  ],
  authors: [{ name: "MCQ Palagu", url: "https://mcqpalagu.in" }],
  creator: "MCQ Palagu",
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: "ta_IN",
    url: "https://mcqpalagu.in",
    siteName: "MCQ Palagu",
    title: "MCQ Palagu | Free TNPSC Group 4 Practice Tests",
    description: "Free MCQ practice for TNPSC Group 4, Group 2, TET & TNUSRB. 6400+ Samacheer questions in Tamil & English.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MCQ Palagu - TNPSC Practice Platform",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MCQ Palagu | Free TNPSC Practice Tests",
    description: "6400+ Samacheer MCQ questions for TNPSC Group 4, Group 2, TET & TNUSRB. Free, no login needed.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://mcqpalagu.in",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${notoSansTamil.variable}`}
        style={{
          margin: 0,
          fontFamily: "var(--font-inter), var(--font-noto-sans-tamil), sans-serif",
          background: "#F0F2F8",
          color: "#1A1A2E",
          minHeight: "100vh",
        }}
      >
        <AppShell>{children}</AppShell>
        <Analytics />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-61615X2667"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-61615X2667');
          `}
        </Script>
      </body>
    </html>
  );
}
