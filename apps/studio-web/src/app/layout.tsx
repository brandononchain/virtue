import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { FloatingActionButton } from "@/components/floating-action-button";

export const metadata: Metadata = {
  title: "Virtue Studio",
  description: "Studio-grade AI video generation",
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
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="flex h-[100dvh] overflow-hidden bg-[#0a0a0a]">
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main content — full width on mobile, flex-1 on desktop */}
        <main className="flex-1 overflow-y-auto pb-[72px] lg:pb-0">{children}</main>

        {/* Mobile bottom nav — hidden on desktop */}
        <BottomNav />
        <FloatingActionButton />
      </body>
    </html>
  );
}
