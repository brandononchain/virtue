"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  {
    label: "Dashboard",
    href: "/",
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zM9 2.5A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zM1 10.5A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zM9 10.5A1.5 1.5 0 0110.5 9h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5v-3z" />
      </svg>
    ),
  },
  {
    label: "Projects",
    href: "/projects",
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M0 4a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H2a2 2 0 01-2-2V4zm5 0v8h6V4H5zm-1 0H2v2h2V4zm0 4H2v2h2V8zm0 4v-0H2v0h2zm8-8h-2v2h2V4zm0 4h-2v2h2V8zm0 4v-0h-2v0h2z" />
      </svg>
    ),
  },
  {
    label: "Renders",
    href: "/renders",
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M4 2l10 6-10 6V2z" />
      </svg>
    ),
  },
  {
    label: "Director",
    href: "/director",
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M2 2h3l2 3h7v9H2V2zm0 1v11h10V6H6.5L4.5 3H3v0z" />
      </svg>
    ),
  },
  {
    label: "Skills",
    href: "/skills",
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M9.5 0L3 9h4.5L6.5 16 13 7H8.5L9.5 0z" />
      </svg>
    ),
  },
];

const continuityNav = [
  {
    label: "Characters",
    href: "/studio/characters",
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm-5 6a5 5 0 0110 0H3z" />
      </svg>
    ),
  },
  {
    label: "Environments",
    href: "/studio/environments",
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M0 13l5-7 3.5 4 2.5-3 5 6H0zm14-9a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: "Props",
    href: "/studio/props",
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M2.5 1A1.5 1.5 0 001 2.5v11A1.5 1.5 0 002.5 15h11a1.5 1.5 0 001.5-1.5v-11A1.5 1.5 0 0013.5 1h-11zM4 4h8v2H4V4zm0 4h5v2H4V8z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r border-zinc-800/60 bg-[#080808]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-800/60">
        <div className="h-6 w-6 rounded bg-zinc-100 flex items-center justify-center">
          <span className="text-[10px] font-black text-zinc-900 leading-none">V</span>
        </div>
        <span className="text-sm font-bold tracking-widest text-zinc-100 uppercase">
          Virtue
        </span>
        <span className="ml-auto rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-500 font-mono">
          0.1
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors ${
                active
                  ? "bg-zinc-800/60 text-zinc-100 font-medium"
                  : "text-zinc-500 hover:bg-zinc-800/30 hover:text-zinc-300"
              }`}
            >
              <span className="w-4 h-4 shrink-0 opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        {/* Editor Section */}
        <div className="mt-4 pt-3 border-t border-zinc-800/40">
          <p className="px-3 mb-2 text-[9px] text-zinc-600 uppercase tracking-widest font-semibold">
            Post-Production
          </p>
          <Link
            href="/studio/exports"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors ${
              pathname.startsWith("/studio/exports")
                ? "bg-zinc-800/60 text-zinc-100 font-medium"
                : "text-zinc-500 hover:bg-zinc-800/30 hover:text-zinc-300"
            }`}
          >
            <span className="w-4 h-4 shrink-0 opacity-70">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 1v2h8V4H4zm0 4v1.5h3V8H4zm0 3v1h8v-1H4zm5-3v1.5h3V8H9z" />
              </svg>
            </span>
            Exports
          </Link>
        </div>

        {/* Autonomous Section */}
        <div className="mt-4 pt-3 border-t border-zinc-800/40">
          <p className="px-3 mb-2 text-[9px] text-zinc-600 uppercase tracking-widest font-semibold">
            Intelligence
          </p>
          <Link
            href="/studio/autonomous"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors ${
              pathname.startsWith("/studio/autonomous")
                ? "bg-zinc-800/60 text-zinc-100 font-medium"
                : "text-zinc-500 hover:bg-zinc-800/30 hover:text-zinc-300"
            }`}
          >
            <span className="w-4 h-4 shrink-0 opacity-70">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zM8 4a1 1 0 100 2 1 1 0 000-2zm-.75 3.5v4.5h1.5V7.5h-1.5z" />
              </svg>
            </span>
            Autonomous
          </Link>
          <Link
            href="/studio/world"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors ${
              pathname.startsWith("/studio/world")
                ? "bg-zinc-800/60 text-zinc-100 font-medium"
                : "text-zinc-500 hover:bg-zinc-800/30 hover:text-zinc-300"
            }`}
          >
            <span className="w-4 h-4 shrink-0 opacity-70">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 0112.58-2.33l-3.8 1.52-2.28-1.9-4.5 2.25V8zm0 .67l4.5-2.25 2.28 1.9 3.8-1.52A6.48 6.48 0 0114.5 8v.67l-4.5 2.25-2.28-1.9-3.8 1.52A6.48 6.48 0 011.5 8.67zM8 14.5a6.47 6.47 0 01-4.58-1.88l3.8-1.52 2.28 1.9 4.5-2.25v.75A6.5 6.5 0 018 14.5z" />
              </svg>
            </span>
            World
          </Link>
        </div>

        {/* Continuity Section */}
        <div className="mt-4 pt-3 border-t border-zinc-800/40">
          <p className="px-3 mb-2 text-[9px] text-zinc-600 uppercase tracking-widest font-semibold">
            Continuity
          </p>
          {continuityNav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors ${
                  active
                    ? "bg-zinc-800/60 text-zinc-100 font-medium"
                    : "text-zinc-500 hover:bg-zinc-800/30 hover:text-zinc-300"
                }`}
              >
                <span className="w-4 h-4 shrink-0 opacity-70">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Provider Status */}
      <div className="border-t border-zinc-800/60 px-5 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
            Mock Provider
          </span>
        </div>
        <p className="text-[10px] text-zinc-700 font-mono">
          localhost:4000
        </p>
      </div>
    </aside>
  );
}
