import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodePath - Developer Project Recommendation Platform",
  description:
    "AI-powered platform that helps developers find the perfect coding projects to advance their careers through personalized recommendations.",
  keywords: [
    "coding projects",
    "developer",
    "AI recommendations",
    "career growth",
    "programming",
  ],
  authors: [{ name: "CodePath" }],
  openGraph: {
    title: "CodePath - Developer Project Recommendation Platform",
    description:
      "AI-powered platform that helps developers find the perfect coding projects to advance their careers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
