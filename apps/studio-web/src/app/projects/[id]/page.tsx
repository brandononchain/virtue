"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { VirtueProject } from "@virtue/types";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<VirtueProject | null>(null);
  const [sceneTitle, setSceneTitle] = useState("");

  useEffect(() => {
    if (id) api.getProject(id).then(setProject).catch(() => {});
  }, [id]);

  async function handleAddScene() {
    if (!sceneTitle.trim() || !project) return;
    const updated = await api.addScene(project.id, { title: sceneTitle });
    setProject(updated);
    setSceneTitle("");
  }

  if (!project) {
    return (
      <div className="p-8">
        <p className="text-zinc-500">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          {project.name}
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          {project.description || "No description"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="studio-panel p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Scenes</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">
            {project.scenes.length}
          </p>
        </div>
        <div className="studio-panel p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Shots</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">
            {project.scenes.reduce((n, s) => n + s.shots.length, 0)}
          </p>
        </div>
        <div className="studio-panel p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Provider</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1 capitalize">
            {project.provider}
          </p>
        </div>
      </div>

      <div className="studio-panel p-6">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">
          Scenes
        </h2>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={sceneTitle}
            onChange={(e) => setSceneTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddScene()}
            placeholder="Add scene..."
            className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
          />
          <button
            onClick={handleAddScene}
            disabled={!sceneTitle.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            Add
          </button>
        </div>

        {project.scenes.length === 0 ? (
          <p className="text-sm text-zinc-600">No scenes yet.</p>
        ) : (
          <div className="space-y-3">
            {project.scenes.map((scene, i) => (
              <div
                key={scene.id}
                className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-3"
              >
                <div>
                  <span className="text-xs text-zinc-600 font-mono mr-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-zinc-200">{scene.title}</span>
                </div>
                <span className="text-xs text-zinc-600">
                  {scene.shots.length} shot{scene.shots.length !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
