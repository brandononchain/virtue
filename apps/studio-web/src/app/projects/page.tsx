"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { VirtueProject } from "@virtue/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<VirtueProject[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listProjects().then(setProjects).catch(() => {});
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const project = await api.createProject(name);
      setProjects((p) => [...p, project]);
      setName("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Projects
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your cinematic generation projects
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="New project name..."
          className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
        />
        <button
          onClick={handleCreate}
          disabled={loading || !name.trim()}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
        >
          Create
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="studio-panel p-12 text-center">
          <p className="text-zinc-500">No projects yet. Create one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="studio-panel p-5 transition-colors hover:border-zinc-600 cursor-pointer">
                <h3 className="font-semibold text-zinc-200">{project.name}</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  {project.scenes.length} scene
                  {project.scenes.length !== 1 ? "s" : ""}
                </p>
                <p className="text-[10px] text-zinc-600 mt-2 uppercase">
                  {project.provider} provider
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
