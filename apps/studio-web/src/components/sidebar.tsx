"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { label: "Dashboard", href: "/", icon: "grid" },
  { label: "Projects", href: "/projects", icon: "film" },
  { label: "Renders", href: "/renders", icon: "play" },
  { label: "Skills", href: "/skills", icon: "zap" },
];

const iconMap: Record<string, React.ReactNode> = {
  grid: <GridIcon />,
  film: <FilmIcon />,
  play: <PlayIcon />,
  zap: <ZapIcon />,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-4">
        <div className="h-6 w-6 rounded bg-blue-600" />
        <span className="text-sm font-bold tracking-wider text-zinc-100 uppercase">
          Virtue
        </span>
        <span className="ml-auto text-[10px] text-zinc-600">v0.1</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-zinc-800/80 text-zinc-100"
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
              }`}
            >
              <span className="w-4 h-4">{iconMap[item.icon]}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-800 px-5 py-3">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
          Mock Provider Active
        </p>
      </div>
    </aside>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zM9 2.5A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zM1 10.5A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zM9 10.5A1.5 1.5 0 0110.5 9h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5v-3z" />
    </svg>
  );
}

function FilmIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M0 4a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H2a2 2 0 01-2-2V4zm2 0v2h2V4H2zm12 0h-2v2h2V4zM2 8v2h2V8H2zm12 0h-2v2h2V8zM2 12h2v-0H2v0zm12 0v0h-2v0h2zM5 4v8h6V4H5z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M4 2l10 6-10 6V2z" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M9.5 0L3 9h4.5L6.5 16 13 7H8.5L9.5 0z" />
    </svg>
  );
}
