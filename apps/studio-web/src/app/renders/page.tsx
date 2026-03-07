"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { VirtueRenderJob } from "@virtue/types";

const statusColors: Record<string, string> = {
  queued: "bg-zinc-700 text-zinc-300",
  preparing: "bg-amber-900/60 text-amber-300",
  generating: "bg-blue-900/60 text-blue-300",
  "post-processing": "bg-purple-900/60 text-purple-300",
  completed: "bg-emerald-900/60 text-emerald-300",
  failed: "bg-red-900/60 text-red-300",
};

export default function RendersPage() {
  const [jobs, setJobs] = useState<VirtueRenderJob[]>([]);

  useEffect(() => {
    api.listRenders().then(setJobs).catch(() => {});
  }, []);

  async function handlePoll(jobId: string) {
    const updated = await api.pollRender(jobId);
    setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Render Queue
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Track and manage generation jobs
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="studio-panel p-12 text-center">
          <p className="text-zinc-500">
            No render jobs. Submit renders from a project&apos;s shot editor.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="studio-panel p-4 flex items-center gap-4"
            >
              <div className="flex-1">
                <p className="text-sm text-zinc-200 font-medium truncate">
                  {job.prompt}
                </p>
                <p className="text-xs text-zinc-600 mt-0.5 font-mono">
                  {job.id.slice(0, 8)}
                </p>
              </div>

              <div className="w-32">
                <div className="h-1.5 rounded-full bg-zinc-800">
                  <div
                    className="h-1.5 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-600 mt-1 text-right">
                  {job.progress}%
                </p>
              </div>

              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase ${
                  statusColors[job.status] || "bg-zinc-800 text-zinc-400"
                }`}
              >
                {job.status}
              </span>

              {job.status !== "completed" && job.status !== "failed" && (
                <button
                  onClick={() => handlePoll(job.id)}
                  className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors"
                >
                  Poll
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
