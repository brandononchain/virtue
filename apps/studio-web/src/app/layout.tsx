import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { FloatingActionButton } from "@/components/floating-action-button";
import { CommandPalette } from "@/components/command-palette";

export const metadata: Metadata = {
  title: "Virtue Studio",
  description: "Studio-grade AI cinematic generation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0A0A0A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="flex h-[100dvh] overflow-hidden bg-cinematic grain">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-[72px] lg:pb-0 bg-cinematic">
          {children}
        </main>

        {/* Mobile */}
        <BottomNav />
        <FloatingActionButton />

        {/* Global command palette */}
        <CommandPalette />
      </body>
    </html>
  );
}
