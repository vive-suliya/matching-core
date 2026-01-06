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
  title: "Matching Core | Universal Matching Kernel",
  description: "High-performance matching engine for your service. Spatial intelligence, hybrid scoring, and universal interface.",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-indigo-500/30 bg-[#030305] text-white`}
      >
        {/* <Header /> Global header removed for clean landing page design */}
        <main>
          {children}
        </main>
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}
