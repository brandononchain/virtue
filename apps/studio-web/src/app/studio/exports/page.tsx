"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { VirtueExportJob, VirtueProject } from "@virtue/types";

export default function ExportsPage() {
  const [exports, setExports] = useState<VirtueExportJob[]>([]);
  const [projects, setProjects] = useState<VirtueProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.listExports(), api.listProjects()]).then(([e, p]) => {
      setExports(e);
      setProjects(p);
      setLoading(false);
    });
  }, []);

  function getProjectName(projectId: string) {
    return projects.find((p) => p.id === projectId)?.name || projectId.slice(0, 8);
  }

  function getSceneTitle(projectId: string, sceneId: string) {
    const project = projects.find((p) => p.id === projectId);
    return project?.scenes.find((s) => s.id === sceneId)?.title || sceneId.slice(0, 8);
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-xl font-bold text-zinc-100">Exports</h1>
        <span className="rounded bg-amber-900/40 border border-amber-800/40 px-2 py-0.5 text-[9px] text-amber-400 font-mono uppercase">
          Post-Production
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading exports...</p>
      ) : exports.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-zinc-500 mb-2">No exports yet</p>
          <p className="text-xs text-zinc-600">
            Open a scene editor to create your first cinematic export
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {exports.map((job) => (
            <div
              key={job.id}
              className="flex items-center gap-4 rounded-lg border border-zinc-800/60 bg-[#0c0c0c] p-4 hover:border-zinc-700/80 transition-all"
            >
              {/* Status indicator */}
              <span
                className={`h-3 w-3 rounded-full shrink-0 ${
                  job.status === "completed"
                    ? "bg-emerald-500"
                    : job.status === "failed"
                      ? "bg-red-400"
                      : "bg-amber-400 animate-pulse"
                }`}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-200 font-medium">
                    {getProjectName(job.projectId)}
                  </span>
                  <span className="text-zinc-700">/</span>
                  <span className="text-sm text-zinc-400">
                    {getSceneTitle(job.projectId, job.sceneId)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-zinc-600 font-mono uppercase">
                    {job.status.replace(/_/g, " ")}
                  </span>
                  {job.output && (
                    <span className="text-[10px] text-zinc-600 font-mono">
                      {job.output.filename}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="w-24">
                <div className="h-1.5 rounded-full bg-zinc-800">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      job.status === "completed"
                        ? "bg-emerald-500"
                        : job.status === "failed"
                          ? "bg-red-500"
                          : "bg-amber-500"
                    }`}
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <span className="text-[9px] text-zinc-600 tabular-nums">
                  {job.progress}%
                </span>
              </div>

              {/* Link to editor */}
              <Link
                href={`/projects/${job.projectId}/scenes/${job.sceneId}/editor`}
                className="text-[10px] text-zinc-500 hover:text-amber-400 uppercase tracking-wider transition-colors"
              >
                Editor
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
