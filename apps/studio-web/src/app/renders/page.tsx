"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import type { VirtueRenderJob } from "@virtue/types";
import { RenderProgressCard } from "@/components/render-progress-card";
import { BottomSheet } from "@/components/bottom-sheet";

type FilterStatus = "all" | "queued" | "preparing" | "generating" | "post-processing" | "completed" | "failed";

const STATUS_CONFIG: Record<
  string,
  { label: string; dotColor: string; textColor: string }
> = {
  queued: { label: "Queued", dotColor: "bg-zinc-500", textColor: "text-zinc-400" },
  preparing: { label: "Planning", dotColor: "bg-amber-400 animate-pulse", textColor: "text-amber-400" },
  generating: { label: "Generating", dotColor: "bg-blue-400 animate-pulse", textColor: "text-blue-400" },
  "post-processing": { label: "Finishing", dotColor: "bg-violet-400 animate-pulse", textColor: "text-violet-400" },
  completed: { label: "Completed", dotColor: "bg-emerald-500", textColor: "text-emerald-400" },
  failed: { label: "Failed", dotColor: "bg-red-400", textColor: "text-red-400" },
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

function isTerminal(status: string) {
  return status === "completed" || status === "failed";
}

export default function RendersPage() {
  const [jobs, setJobs] = useState<VirtueRenderJob[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selectedJob, setSelectedJob] = useState<VirtueRenderJob | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.listRenders().then(setJobs).catch(() => {});
  }, []);

  useEffect(() => {
    const hasActive = jobs.some((j) => !isTerminal(j.status));
    if (hasActive) {
      pollRef.current = setInterval(() => {
        api.listRenders().then((fresh) => {
          setJobs(fresh);
          setSelectedJob((prev) => {
            if (!prev) return null;
            return fresh.find((j) => j.id === prev.id) || prev;
          });
        }).catch(() => {});
      }, 5000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [jobs.some((j) => !isTerminal(j.status))]);

  async function handlePoll(jobId: string) {
    const updated = await api.pollRender(jobId);
    setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
    if (selectedJob?.id === jobId) setSelectedJob(updated);
  }

  function handleSelect(job: VirtueRenderJob) {
    setSelectedJob(job);
    setShowDetail(true);
  }

  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  const counts = {
    all: jobs.length,
    queued: jobs.filter((j) => j.status === "queued").length,
    preparing: jobs.filter((j) => j.status === "preparing").length,
    generating: jobs.filter((j) => j.status === "generating").length,
    "post-processing": jobs.filter((j) => j.status === "post-processing").length,
    completed: jobs.filter((j) => j.status === "completed").length,
    failed: jobs.filter((j) => j.status === "failed").length,
  };

  const detailContent = selectedJob && (
    <div className="space-y-5">
      {selectedJob.output?.url && selectedJob.status === "completed" && (
        <div className="rounded-lg overflow-hidden border border-zinc-800/60 bg-black">
          <video
            src={selectedJob.output.url}
            controls
            autoPlay
            loop
            muted
            playsInline
            className="w-full aspect-video"
          />
        </div>
      )}

      <div>
        <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Status</label>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${STATUS_CONFIG[selectedJob.status]?.dotColor || "bg-zinc-500"}`} />
          <span className={`text-sm font-medium ${STATUS_CONFIG[selectedJob.status]?.textColor || "text-zinc-400"}`}>
            {STATUS_CONFIG[selectedJob.status]?.label || selectedJob.status}
          </span>
          <span className="text-xs text-zinc-600 ml-auto tabular-nums">{selectedJob.progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-800 mt-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              selectedJob.status === "completed" ? "bg-emerald-500"
                : selectedJob.status === "failed" ? "bg-red-500" : "bg-blue-500"
            }`}
            style={{ width: `${selectedJob.progress}%` }}
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Prompt</label>
        <p className="text-[13px] text-zinc-400 leading-relaxed bg-zinc-900/60 rounded-md p-3 border border-zinc-800/40">
          {selectedJob.prompt}
        </p>
      </div>

      {selectedJob.error && (
        <div>
          <label className="block text-[10px] text-red-400/70 uppercase tracking-wider mb-1.5">Error</label>
          <p className="text-[13px] text-red-400 bg-red-950/20 rounded-md p-3 border border-red-900/30">{selectedJob.error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-zinc-600 mb-0.5">Provider</p>
          <p className="text-[13px] text-zinc-300 font-mono">{selectedJob.provider}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-600 mb-0.5">Job ID</p>
          <p className="text-[13px] text-zinc-300 font-mono truncate">{selectedJob.id.slice(0, 12)}</p>
        </div>
      </div>

      {selectedJob.skills.length > 0 && (
        <div>
          <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Skills Used</label>
          <div className="flex flex-wrap gap-1.5">
            {selectedJob.skills.map((skill) => (
              <span key={skill} className="rounded bg-zinc-800/80 px-2 py-1 text-[11px] text-zinc-400 font-mono">
                {skill.replace("skill-", "")}
              </span>
            ))}
          </div>
        </div>
      )}

      {selectedJob.output && (
        <div>
          <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Output</label>
          <div className="bg-zinc-900/60 rounded-md p-3 border border-zinc-800/40 space-y-1">
            <p className="text-[13px] text-zinc-300 font-mono truncate">{selectedJob.output.filename}</p>
            <p className="text-[10px] text-zinc-600 truncate">{selectedJob.output.url}</p>
          </div>
        </div>
      )}

      {!isTerminal(selectedJob.status) && selectedJob.provider === "mock" && (
        <button
          onClick={() => handlePoll(selectedJob.id)}
          className="w-full rounded-md bg-zinc-100 py-3 text-[15px] font-medium text-zinc-900 transition-colors hover:bg-white active:scale-[0.98] touch-manipulation"
        >
          Advance Pipeline
        </button>
      )}

      {!isTerminal(selectedJob.status) && selectedJob.provider !== "mock" && (
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          Auto-polling... checking every 5s
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-[22px] sm:text-2xl font-bold tracking-tight text-zinc-100">
            Render Queue
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} total
          </p>
        </div>

        {/* Filter tabs — horizontally scrollable on mobile */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {FILTER_OPTIONS.map((opt) => {
            const count = counts[opt.value];
            if (opt.value !== "all" && count === 0) return null;
            return (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`rounded-md px-3 py-2 sm:py-1.5 text-[13px] sm:text-xs transition-colors shrink-0 touch-manipulation ${
                  filter === opt.value
                    ? "bg-zinc-800 text-zinc-200 font-medium"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                }`}
              >
                {opt.label}
                {count > 0 && <span className="ml-1.5 text-zinc-600">{count}</span>}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="studio-panel p-12 text-center">
            <p className="text-zinc-600 text-sm">No render jobs to show.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((job) => (
              <RenderProgressCard key={job.id} job={job} onClick={() => handleSelect(job)} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop detail panel */}
      {selectedJob && (
        <div className="hidden lg:block w-96 border-l border-zinc-800/60 bg-[#080808] overflow-y-auto shrink-0">
          <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Job Detail</h2>
            <button
              onClick={() => { setSelectedJob(null); setShowDetail(false); }}
              className="text-zinc-600 hover:text-zinc-300 text-xs transition-colors min-h-[44px] flex items-center"
            >
              Close
            </button>
          </div>
          <div className="p-5">{detailContent}</div>
        </div>
      )}

      {/* Mobile detail bottom sheet */}
      <div className="lg:hidden">
        <BottomSheet open={showDetail && !!selectedJob} onClose={() => setShowDetail(false)} title="Job Detail">
          {detailContent}
        </BottomSheet>
      </div>
    </div>
  );
}
