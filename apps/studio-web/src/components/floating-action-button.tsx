"use client";

import { useState } from "react";
import { BottomSheet } from "./bottom-sheet";
import Link from "next/link";

const actions = [
  {
    label: "New Project",
    href: "/projects",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    description: "Start a new cinematic project",
  },
  {
    label: "New Scene",
    href: "/director",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    description: "Add a scene using the Director",
  },
  {
    label: "New Shot",
    href: "/projects",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    description: "Create a new shot in a project",
  },
  {
    label: "Generate Render",
    href: "/renders",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    description: "Submit a new render job",
  },
];

export function FloatingActionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-[76px] z-50 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 shadow-lg shadow-black/40 active:scale-95 transition-transform lg:hidden"
        aria-label="Create"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-7 h-7">
          <path d="M12 4v16m8-8H4" strokeLinecap="round" />
        </svg>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Create">
        <div className="space-y-1">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 rounded-xl px-4 py-3.5 active:bg-zinc-800/60 transition-colors"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 shrink-0">
                {action.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-zinc-200">{action.label}</p>
                <p className="text-[13px] text-zinc-500">{action.description}</p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-zinc-600 shrink-0">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
