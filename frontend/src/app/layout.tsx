import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aura - AI Resume Analyzer & Job Matcher",
  description: "High-end AI Resume Analyzer and Job Matcher.",
};

import LenisProvider from "@/components/LenisProvider";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} antialiased scroll-smooth`}
    >
      <body className="min-h-screen bg-black text-white font-sans selection:bg-acid selection:text-black flex flex-col relative overflow-x-hidden">
        <Navbar />
        <LenisProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </LenisProvider>
      </body>
    </html>
  );
}
