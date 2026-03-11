"use client";

import { useState } from "react";
import { BottomSheet } from "./bottom-sheet";
import Link from "next/link";
import {
  Plus,
  FolderOpen,
  Clapperboard,
  Camera,
  Zap,
} from "lucide-react";

const actions = [
  { label: "New Project", href: "/projects", icon: FolderOpen, description: "Start a new cinematic project" },
  { label: "New Scene", href: "/director", icon: Clapperboard, description: "Create a scene using the Director" },
  { label: "New Shot", href: "/projects", icon: Camera, description: "Add a shot to a project" },
  { label: "Generate Render", href: "/renders", icon: Zap, description: "Submit a new render job" },
];

export function FloatingActionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-[76px] z-50 flex h-14 w-14 items-center justify-center rounded-full bg-virtue-accent text-white shadow-glow-accent active:scale-95 transition-all duration-200 lg:hidden hover:shadow-[0_0_30px_rgba(76,125,255,0.3)]"
        aria-label="Create"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Create">
        <div className="space-y-1">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-4 rounded-xl px-4 py-3.5 active:bg-[rgba(255,255,255,0.04)] transition-colors touch-manipulation"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-virtue-text-secondary shrink-0">
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-virtue-text">{action.label}</p>
                  <p className="text-[13px] text-virtue-text-muted">{action.description}</p>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-virtue-text-muted/50 shrink-0">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}
