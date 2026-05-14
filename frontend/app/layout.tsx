import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Noto_Sans_Tamil } from "next/font/google";
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
  title: "MCQ பழகு - TNPSC Practice",
  description: "MCQ பழகு - Samacheer MCQ practice for TN exam aspirants",
  openGraph: {
    title: "MCQ பழகு - TNPSC Practice",
    description: "MCQ பழகு - Samacheer MCQ practice for TN exam aspirants",
    images: ["/og-image.png"],
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
      </body>
    </html>
  );
}
