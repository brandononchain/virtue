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
