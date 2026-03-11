"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { VirtueExportJob, VirtueProject } from "@virtue/types";
import {
  FileVideo,
  ArrowRight,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
  Film,
} from "lucide-react";

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
    <div className="p-5 sm:p-8 lg:p-10 space-y-8 max-w-5xl animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
          <FileVideo className="h-5 w-5 text-virtue-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-virtue-text">Exports</h1>
          <span className="section-label">Post-Production</span>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 text-virtue-text-muted animate-spin" />
          <p className="text-sm text-virtue-text-muted">Loading exports...</p>
        </div>
      ) : exports.length === 0 ? (
        <div className="glass-panel text-center py-20 px-6">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
              <Film className="h-6 w-6 text-virtue-text-muted" />
            </div>
          </div>
          <p className="text-sm text-virtue-text-muted mb-2">No exports yet</p>
          <p className="text-xs text-virtue-text-muted">
            Open a scene editor to create your first cinematic export
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {exports.map((job) => (
            <div
              key={job.id}
              className="glass-card flex items-center gap-4 p-4 hover:border-[rgba(255,255,255,0.12)] transition-all group"
            >
              {/* Status indicator */}
              <div className="shrink-0">
                {job.status === "completed" ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                ) : job.status === "failed" ? (
                  <XCircle className="h-4 w-4 text-red-400" />
                ) : (
                  <Loader2 className="h-4 w-4 text-virtue-accent animate-spin" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-virtue-text font-medium">
                    {getProjectName(job.projectId)}
                  </span>
                  <ArrowRight className="h-3 w-3 text-virtue-text-muted" />
                  <span className="text-sm text-virtue-text-secondary">
                    {getSceneTitle(job.projectId, job.sceneId)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-virtue-text-muted font-mono uppercase">
                    {job.status.replace(/_/g, " ")}
                  </span>
                  {job.output && (
                    <span className="text-[10px] text-virtue-text-muted font-mono flex items-center gap-1">
                      <Download className="h-2.5 w-2.5" />
                      {job.output.filename}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="w-24">
                <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.04)]">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      job.status === "completed"
                        ? "bg-emerald-500"
                        : job.status === "failed"
                          ? "bg-red-500"
                          : "bg-virtue-accent"
                    }`}
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <span className="text-[9px] text-virtue-text-muted tabular-nums">
                  {job.progress}%
                </span>
              </div>

              {/* Link to editor */}
              <Link
                href={`/projects/${job.projectId}/scenes/${job.sceneId}/editor`}
                className="flex items-center gap-1 text-[10px] text-virtue-text-muted hover:text-virtue-accent uppercase tracking-wider transition-colors"
              >
                Editor
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
