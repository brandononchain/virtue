"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { VirtueRenderJob } from "@virtue/types";

type FilterStatus = "all" | "queued" | "preparing" | "generating" | "post-processing" | "completed" | "failed";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dotColor: string; textColor: string }
> = {
  queued: {
    label: "Queued",
    color: "bg-zinc-800",
    dotColor: "bg-zinc-500",
    textColor: "text-zinc-400",
  },
  preparing: {
    label: "Planning",
    color: "bg-amber-950/40",
    dotColor: "bg-amber-400 animate-pulse",
    textColor: "text-amber-400",
  },
  generating: {
    label: "Generating",
    color: "bg-blue-950/40",
    dotColor: "bg-blue-400 animate-pulse",
    textColor: "text-blue-400",
  },
  "post-processing": {
    label: "Finishing",
    color: "bg-violet-950/40",
    dotColor: "bg-violet-400 animate-pulse",
    textColor: "text-violet-400",
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-950/30",
    dotColor: "bg-emerald-500",
    textColor: "text-emerald-400",
  },
  failed: {
    label: "Failed",
    color: "bg-red-950/30",
    dotColor: "bg-red-400",
    textColor: "text-red-400",
  },
};

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "queued", label: "Queued" },
  { value: "preparing", label: "Planning" },
  { value: "generating", label: "Generating" },
  { value: "post-processing", label: "Finishing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

export default function RendersPage() {
  const [jobs, setJobs] = useState<VirtueRenderJob[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selectedJob, setSelectedJob] = useState<VirtueRenderJob | null>(null);

  useEffect(() => {
    api.listRenders().then(setJobs).catch(() => {});
  }, []);

  async function handlePoll(jobId: string) {
    const updated = await api.pollRender(jobId);
    setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
    if (selectedJob?.id === jobId) setSelectedJob(updated);
  }

  const filtered =
    filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  const counts = {
    all: jobs.length,
    queued: jobs.filter((j) => j.status === "queued").length,
    preparing: jobs.filter((j) => j.status === "preparing").length,
    generating: jobs.filter((j) => j.status === "generating").length,
    "post-processing": jobs.filter((j) => j.status === "post-processing")
      .length,
    completed: jobs.filter((j) => j.status === "completed").length,
    failed: jobs.filter((j) => j.status === "failed").length,
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Render Queue
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} total
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {FILTER_OPTIONS.map((opt) => {
            const count = counts[opt.value];
            if (opt.value !== "all" && count === 0) return null;
            return (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                  filter === opt.value
                    ? "bg-zinc-800 text-zinc-200 font-medium"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                }`}
              >
                {opt.label}
                {count > 0 && (
                  <span className="ml-1.5 text-zinc-600">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Job list */}
        {filtered.length === 0 ? (
          <div className="studio-panel p-12 text-center">
            <p className="text-zinc-600 text-sm">No render jobs to show.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((job) => {
              const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.queued;
              const isSelected = selectedJob?.id === job.id;
              return (
                <button
                  key={job.id}
                  onClick={() =>
                    setSelectedJob(isSelected ? null : job)
                  }
                  className={`w-full text-left studio-panel p-4 flex items-center gap-4 transition-all ${
                    isSelected ? "border-zinc-600" : ""
                  }`}
                >
                  {/* Status dot */}
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${cfg.dotColor}`}
                  />

                  {/* Prompt */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 truncate">
                      {job.prompt}
                    </p>
                    <p className="text-[10px] text-zinc-700 font-mono mt-0.5">
                      {job.id.slice(0, 12)}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-28 shrink-0">
                    <div className="h-1 rounded-full bg-zinc-800">
                      <div
                        className={`h-1 rounded-full transition-all duration-500 ${
                          job.status === "completed"
                            ? "bg-emerald-500"
                            : job.status === "failed"
                              ? "bg-red-500"
                              : "bg-blue-500"
                        }`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-zinc-700 mt-0.5 text-right tabular-nums">
                      {job.progress}%
                    </p>
                  </div>

                  {/* Status chip */}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase shrink-0 ${cfg.color} ${cfg.textColor}`}
                  >
                    {cfg.label}
                  </span>

                  {/* Poll button */}
                  {job.status !== "completed" && job.status !== "failed" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePoll(job.id);
                      }}
                      className="rounded border border-zinc-700/50 px-2.5 py-1 text-[10px] text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors shrink-0"
                    >
                      Advance
                    </button>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Job detail panel */}
      {selectedJob && (
        <div className="w-96 border-l border-zinc-800/60 bg-[#080808] overflow-y-auto shrink-0">
          <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Job Detail
            </h2>
            <button
              onClick={() => setSelectedJob(null)}
              className="text-zinc-600 hover:text-zinc-300 text-xs transition-colors"
            >
              Close
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Status */}
            <div>
              <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    STATUS_CONFIG[selectedJob.status]?.dotColor || "bg-zinc-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    STATUS_CONFIG[selectedJob.status]?.textColor ||
                    "text-zinc-400"
                  }`}
                >
                  {STATUS_CONFIG[selectedJob.status]?.label || selectedJob.status}
                </span>
                <span className="text-xs text-zinc-600 ml-auto tabular-nums">
                  {selectedJob.progress}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 mt-2">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    selectedJob.status === "completed"
                      ? "bg-emerald-500"
                      : selectedJob.status === "failed"
                        ? "bg-red-500"
                        : "bg-blue-500"
                  }`}
                  style={{ width: `${selectedJob.progress}%` }}
                />
              </div>
            </div>

            {/* Prompt */}
            <div>
              <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                Prompt
              </label>
              <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-900/60 rounded-md p-3 border border-zinc-800/40">
                {selectedJob.prompt}
              </p>
            </div>

            {/* Error */}
            {selectedJob.error && (
              <div>
                <label className="block text-[10px] text-red-400/70 uppercase tracking-wider mb-1.5">
                  Error
                </label>
                <p className="text-xs text-red-400 bg-red-950/20 rounded-md p-3 border border-red-900/30">
                  {selectedJob.error}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-zinc-600 mb-0.5">Provider</p>
                <p className="text-xs text-zinc-300 font-mono">
                  {selectedJob.provider}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-600 mb-0.5">Job ID</p>
                <p className="text-xs text-zinc-300 font-mono truncate">
                  {selectedJob.id.slice(0, 12)}
                </p>
              </div>
            </div>

            {/* Skills */}
            {selectedJob.skills.length > 0 && (
              <div>
                <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                  Skills Used
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-400 font-mono"
                    >
                      {skill.replace("skill-", "")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Output */}
            {selectedJob.output && (
              <div>
                <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                  Output
                </label>
                <div className="bg-zinc-900/60 rounded-md p-3 border border-zinc-800/40 space-y-1">
                  <p className="text-xs text-zinc-300 font-mono truncate">
                    {selectedJob.output.filename}
                  </p>
                  <p className="text-[10px] text-zinc-600 truncate">
                    {selectedJob.output.url}
                  </p>
                </div>
              </div>
            )}

            {/* Poll */}
            {selectedJob.status !== "completed" &&
              selectedJob.status !== "failed" && (
                <button
                  onClick={() => handlePoll(selectedJob.id)}
                  className="w-full rounded-md bg-zinc-100 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
                >
                  Advance Pipeline
                </button>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
