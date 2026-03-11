"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { BottomSheet } from "@/components/bottom-sheet";
import { FolderOpen, Plus, ArrowRight, Film, Clapperboard } from "lucide-react";
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
        <label className="section-label mb-1.5">Project Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="e.g. Neon City"
          className="glass-input w-full"
          autoFocus
        />
      </div>
      <div>
        <label className="section-label mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief synopsis or concept..."
          rows={3}
          className="glass-input w-full resize-none"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => setShowCreate(false)}
          className="rounded-md px-4 py-2.5 sm:py-1.5 text-[15px] sm:text-sm text-virtue-text-secondary hover:text-virtue-text transition-colors touch-manipulation"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={creating || !name.trim()}
          className="btn-primary touch-manipulation active:scale-[0.98]"
        >
          {creating ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-5 sm:p-8 lg:p-10 space-y-5 sm:space-y-7 max-w-[1200px] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] sm:text-2xl font-bold tracking-tight text-virtue-text">
            Projects
          </h1>
          <p className="text-sm text-virtue-text-muted mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn-primary flex items-center gap-2 touch-manipulation active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Desktop create form */}
      {showCreate && (
        <div className="hidden sm:block glass-panel p-5 space-y-4">
          <h2 className="section-label text-virtue-text-secondary">Create Project</h2>
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
        <div className="glass-panel p-16 text-center">
          <FolderOpen className="w-10 h-10 text-virtue-text-muted mx-auto mb-4" />
          <p className="text-virtue-text-muted text-sm">No projects yet.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-3 text-[14px] sm:text-sm text-virtue-accent hover:text-virtue-text transition-colors touch-manipulation min-h-[44px] flex items-center gap-1.5 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {projects.map((project) => {
            const shotCount = project.scenes.reduce((n, s) => n + s.shots.length, 0);
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="glass-card p-4 sm:p-5 h-full transition-all hover:border-[rgba(255,255,255,0.12)] active:scale-[0.98] cursor-pointer group touch-manipulation">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-[15px] sm:text-base text-virtue-text group-hover:text-white transition-colors">
                      {project.name}
                    </h3>
                    <span className="rounded bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] px-1.5 py-0.5 text-[9px] text-virtue-text-muted font-mono uppercase">
                      {project.provider}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-[13px] sm:text-xs text-virtue-text-secondary mt-2 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1 text-[12px] sm:text-xs text-virtue-text-muted">
                        <Film className="w-3 h-3" />
                        {project.scenes.length} scene{project.scenes.length !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1 text-[12px] sm:text-xs text-virtue-text-muted">
                        <Clapperboard className="w-3 h-3" />
                        {shotCount} shot{shotCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-virtue-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
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
