"use client";

import { Inter } from "next/font/google";
import "../styles/globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}