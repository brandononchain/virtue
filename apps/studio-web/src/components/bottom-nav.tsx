"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Play,
  Clapperboard,
  LayoutTemplate,
} from "lucide-react";

const tabs = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, match: (p: string) => p === "/" },
  { label: "Projects", href: "/projects", icon: FolderOpen, match: (p: string) => p.startsWith("/projects") },
  { label: "Renders", href: "/renders", icon: Play, match: (p: string) => p.startsWith("/renders") },
  { label: "Director", href: "/director", icon: Clapperboard, match: (p: string) => p.startsWith("/director") },
  { label: "Library", href: "/studio/templates", icon: LayoutTemplate, match: (p: string) => p.startsWith("/studio") || p.startsWith("/skills") },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[rgba(255,255,255,0.06)] bg-[#0A0A0A]/95 backdrop-blur-xl lg:hidden safe-bottom">
      <div className="flex items-stretch justify-around">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center gap-1 py-2.5 px-3 min-h-[56px] min-w-[64px] transition-colors touch-manipulation ${
                active ? "text-virtue-accent" : "text-virtue-text-muted active:text-virtue-text-secondary"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2 : 1.5} />
              <span className={`text-[10px] font-medium ${active ? "text-virtue-accent" : "text-virtue-text-muted"}`}>
                {tab.label}
              </span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-virtue-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
