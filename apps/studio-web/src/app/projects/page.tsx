"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { BottomSheet } from "@/components/bottom-sheet";
import type { VirtueProject } from "@virtue/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<VirtueProject[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.listProjects().then(setProjects).catch(() => {});
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const project = await api.createProject(name, description || undefined);
      setProjects((p) => [...p, project]);
      setName("");
      setDescription("");
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  }

  const createForm = (
    <div className="space-y-4">
      <div>
        <label className="block text-[13px] sm:text-xs text-zinc-500 mb-1.5">Project Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="e.g. Neon City"
          className="w-full rounded-md border border-zinc-800 bg-zinc-900/80 px-3 py-3 sm:py-2 text-[15px] sm:text-sm text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-[13px] sm:text-xs text-zinc-500 mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief synopsis or concept..."
          rows={3}
          className="w-full rounded-md border border-zinc-800 bg-zinc-900/80 px-3 py-3 sm:py-2 text-[15px] sm:text-sm text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none resize-none"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => setShowCreate(false)}
          className="rounded-md px-4 py-2.5 sm:py-1.5 text-[15px] sm:text-sm text-zinc-400 hover:text-zinc-200 transition-colors touch-manipulation"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={creating || !name.trim()}
          className="rounded-md bg-zinc-100 px-6 py-2.5 sm:py-1.5 text-[15px] sm:text-sm font-medium text-zinc-900 transition-colors hover:bg-white disabled:opacity-40 touch-manipulation active:scale-[0.98]"
        >
          {creating ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] sm:text-2xl font-bold tracking-tight text-zinc-100">Projects</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-md bg-zinc-100 px-4 py-2.5 sm:py-2 text-[14px] sm:text-sm font-medium text-zinc-900 transition-colors hover:bg-white active:scale-[0.98] touch-manipulation"
        >
          New Project
        </button>
      </div>

      {/* Desktop create form */}
      {showCreate && (
        <div className="hidden sm:block studio-panel p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Create Project</h2>
          {createForm}
        </div>
      )}

      {/* Mobile create bottom sheet */}
      <div className="sm:hidden">
        <BottomSheet open={showCreate} onClose={() => setShowCreate(false)} title="Create Project">
          {createForm}
        </BottomSheet>
      </div>

      {/* Project grid */}
      {projects.length === 0 && !showCreate ? (
        <div className="studio-panel p-16 text-center">
          <p className="text-zinc-600 text-sm">No projects yet.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-3 text-[14px] sm:text-sm text-zinc-400 hover:text-zinc-200 transition-colors touch-manipulation min-h-[44px]"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {projects.map((project) => {
            const shotCount = project.scenes.reduce((n, s) => n + s.shots.length, 0);
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="studio-panel p-4 sm:p-5 h-full transition-all hover:border-zinc-600 active:scale-[0.98] cursor-pointer group touch-manipulation">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-[15px] sm:text-base text-zinc-200 group-hover:text-zinc-100 transition-colors">
                      {project.name}
                    </h3>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-500 font-mono uppercase">
                      {project.provider}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-[13px] sm:text-xs text-zinc-500 mt-2 line-clamp-2">{project.description}</p>
                  )}
                  <div className="flex gap-4 mt-4 pt-3 border-t border-zinc-800/50">
                    <span className="text-[12px] sm:text-xs text-zinc-600">
                      {project.scenes.length} scene{project.scenes.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-[12px] sm:text-xs text-zinc-600">
                      {shotCount} shot{shotCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
