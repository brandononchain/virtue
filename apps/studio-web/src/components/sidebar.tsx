"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Play,
  Clapperboard,
  LayoutTemplate,
  Zap,
  FileVideo,
  Sparkles,
  Globe,
  Users,
  MapPin,
  Box,
  Search,
} from "lucide-react";

const mainNav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, exact: true },
  { label: "Projects", href: "/projects", icon: FolderOpen },
  { label: "Renders", href: "/renders", icon: Play },
  { label: "Director", href: "/director", icon: Clapperboard },
  { label: "Templates", href: "/studio/templates", icon: LayoutTemplate },
  { label: "Skills", href: "/skills", icon: Zap },
];

const postProdNav = [
  { label: "Exports", href: "/studio/exports", icon: FileVideo },
];

const intelligenceNav = [
  { label: "Autonomous", href: "/studio/autonomous", icon: Sparkles },
  { label: "World", href: "/studio/world", icon: Globe },
];

const continuityNav = [
  { label: "Characters", href: "/studio/characters", icon: Users },
  { label: "Environments", href: "/studio/environments", icon: MapPin },
  { label: "Props", href: "/studio/props", icon: Box },
];

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: { label: string; href: string; icon: React.ElementType; exact?: boolean }[];
  pathname: string;
}) {
  return (
    <div className="mt-6 first:mt-0">
      <p className="px-3 mb-2 section-label">{label}</p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all duration-200 ${
                active
                  ? "bg-[rgba(255,255,255,0.06)] text-virtue-text font-medium"
                  : "text-virtue-text-secondary hover:bg-[rgba(255,255,255,0.03)] hover:text-virtue-text"
              }`}
            >
              <Icon
                className={`w-[16px] h-[16px] shrink-0 ${
                  active ? "text-virtue-accent" : "opacity-50"
                }`}
                strokeWidth={1.75}
              />
              {item.label}
              {active && (
                <span className="ml-auto w-1 h-1 rounded-full bg-virtue-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r border-[rgba(255,255,255,0.06)] bg-[#0C0C0C]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[rgba(255,255,255,0.06)]">
        <div className="h-7 w-7 rounded-lg bg-virtue-accent/10 border border-virtue-accent/20 flex items-center justify-center">
          <span className="text-[11px] font-bold text-virtue-accent leading-none">V</span>
        </div>
        <div className="flex-1">
          <span className="text-[13px] font-semibold tracking-wider text-virtue-text uppercase">
            Virtue
          </span>
        </div>
        <span className="rounded-md bg-[rgba(255,255,255,0.04)] px-1.5 py-0.5 text-[9px] text-virtue-text-muted font-mono border border-[rgba(255,255,255,0.06)]">
          0.1
        </span>
      </div>

      {/* Search trigger */}
      <div className="px-3 pt-4 pb-1">
        <button
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
          }}
          className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-virtue-text-muted bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.08)] transition-all"
        >
          <Search className="w-3.5 h-3.5 opacity-50" strokeWidth={1.75} />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="text-[9px] font-mono bg-[rgba(255,255,255,0.06)] rounded px-1 py-0.5">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto no-scrollbar">
        <NavSection label="Studio" items={mainNav} pathname={pathname} />
        <NavSection label="Post-Production" items={postProdNav} pathname={pathname} />
        <NavSection label="Intelligence" items={intelligenceNav} pathname={pathname} />
        <NavSection label="Continuity" items={continuityNav} pathname={pathname} />
      </nav>

      {/* Provider Status */}
      <div className="border-t border-[rgba(255,255,255,0.06)] px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 status-pulse" />
          <span className="text-[10px] text-virtue-text-muted uppercase tracking-widest font-medium">
            Mock Provider
          </span>
        </div>
        <p className="text-[10px] text-virtue-text-muted/50 font-mono mt-1">
          localhost:4000
        </p>
      </div>
    </aside>
  );
}
