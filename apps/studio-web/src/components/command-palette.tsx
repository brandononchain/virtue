"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FolderOpen,
  Clapperboard,
  Play,
  Zap,
  Users,
  Globe,
  LayoutTemplate,
  FileVideo,
  Sparkles,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  icon: React.ReactNode;
  keywords: string[];
}

const commands: CommandItem[] = [
  { id: "dashboard", label: "Dashboard", description: "Production overview", href: "/", icon: <Sparkles className="w-4 h-4" />, keywords: ["home", "overview", "stats"] },
  { id: "projects", label: "Projects", description: "Browse all projects", href: "/projects", icon: <FolderOpen className="w-4 h-4" />, keywords: ["project", "browse", "list"] },
  { id: "new-project", label: "Create Project", description: "Start a new cinematic project", href: "/projects", icon: <FolderOpen className="w-4 h-4" />, keywords: ["new", "create", "project"] },
  { id: "renders", label: "Render Queue", description: "View all render jobs", href: "/renders", icon: <Play className="w-4 h-4" />, keywords: ["render", "queue", "job", "generate"] },
  { id: "director", label: "Director", description: "AI scene generation", href: "/director", icon: <Clapperboard className="w-4 h-4" />, keywords: ["director", "scene", "ai", "generate"] },
  { id: "templates", label: "Templates", description: "Cinematic template library", href: "/studio/templates", icon: <LayoutTemplate className="w-4 h-4" />, keywords: ["template", "library", "preset"] },
  { id: "skills", label: "Skills", description: "Visual skill engine", href: "/skills", icon: <Zap className="w-4 h-4" />, keywords: ["skill", "engine", "visual"] },
  { id: "characters", label: "Characters", description: "Continuity characters", href: "/studio/characters", icon: <Users className="w-4 h-4" />, keywords: ["character", "continuity", "actor"] },
  { id: "environments", label: "Environments", description: "Scene environments", href: "/studio/environments", icon: <Globe className="w-4 h-4" />, keywords: ["environment", "location", "scene"] },
  { id: "exports", label: "Exports", description: "Exported compositions", href: "/studio/exports", icon: <FileVideo className="w-4 h-4" />, keywords: ["export", "composition", "final"] },
  { id: "autonomous", label: "Autonomous", description: "AI production intelligence", href: "/studio/autonomous", icon: <Sparkles className="w-4 h-4" />, keywords: ["autonomous", "ai", "intelligence", "analyze"] },
  { id: "world", label: "World State", description: "Simulation engine", href: "/studio/world", icon: <Globe className="w-4 h-4" />, keywords: ["world", "simulation", "state"] },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const filtered = query.length === 0
    ? commands
    : commands.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.label.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.keywords.some((k) => k.includes(q))
        );
      });

  const handleSelect = useCallback(
    (item: CommandItem) => {
      setOpen(false);
      setQuery("");
      router.push(item.href);
    },
    [router],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setSelectedIndex(0);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, filtered, selectedIndex, handleSelect]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div className="relative w-full max-w-[560px] mx-4 animate-scale-in">
        <div className="glass-panel-elevated overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
            <Search className="w-5 h-5 text-virtue-text-muted shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands..."
              className="flex-1 bg-transparent text-[15px] text-virtue-text placeholder:text-virtue-text-muted outline-none"
              autoFocus
            />
            <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-virtue-text-muted bg-[rgba(255,255,255,0.06)] rounded px-1.5 py-0.5 font-mono">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[360px] overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-virtue-text-muted">
                No commands found
              </div>
            ) : (
              filtered.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                    i === selectedIndex
                      ? "bg-[rgba(255,255,255,0.06)]"
                      : "hover:bg-[rgba(255,255,255,0.03)]"
                  }`}
                >
                  <span className={`shrink-0 ${i === selectedIndex ? "text-virtue-accent" : "text-virtue-text-muted"}`}>
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-virtue-text font-medium">
                      {item.label}
                    </p>
                    {item.description && (
                      <p className="text-[12px] text-virtue-text-muted truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {i === selectedIndex && (
                    <span className="text-[10px] text-virtue-text-muted font-mono">
                      Enter
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
