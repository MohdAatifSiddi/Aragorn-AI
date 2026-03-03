/**
 * Root Layout Component
 * 
 * Provides the base HTML structure and global providers for the entire application.
 * 
 * Features:
 * - Custom font loading (Geist Sans & Mono)
 * - Dark theme support via next-themes
 * - Toast notifications via Sonner
 * - Browser logging for debugging (Orchids)
 * - Visual editing support (Orchids CMS)
 * - Global CSS styles
 * 
 * @layout Root layout for all pages
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import Script from "next/script";

// Load Geist Sans font with CSS variable
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Load Geist Mono font with CSS variable
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Application metadata for SEO and browser display
 */
export const metadata: Metadata = {
  title: "Aragorn AI | Edge Construction Intelligence",
  description: "Enterprise-grade construction safety and progress tracking at the edge.",
};

/**
 * RootLayout Component
 * Wraps all pages with necessary providers and global elements
 * 
 * @param children - Page content to be rendered
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        {/* Orchids Browser Logging Script - For debugging and monitoring */}
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="29560945-5db8-4f7b-b510-e2e51e7032eb"
        />
        
        {/* Theme Provider - Enables dark mode support */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Page Content */}
          {children}
          
          {/* Toast Notification System - Top right position */}
          <Toaster position="top-right" />
        </ThemeProvider>
        
        {/* Visual Edits Messenger - For CMS integration */}
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
