"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import type { VirtueRenderJob } from "@virtue/types";
import { RenderProgressCard } from "@/components/render-progress-card";
import { BottomSheet } from "@/components/bottom-sheet";
import {
  Film,
  X,
  AlertTriangle,
  Activity,
  Clock,
  Cpu,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clapperboard,
  Hash,
  Server,
  Layers,
  FastForward,
} from "lucide-react";

type FilterStatus = "all" | "queued" | "preparing" | "generating" | "post-processing" | "completed" | "failed";

const STATUS_CONFIG: Record<
  string,
  { label: string; dotColor: string; textColor: string; icon: typeof Film }
> = {
  queued: { label: "Queued", dotColor: "bg-virtue-text-muted", textColor: "text-virtue-text-muted", icon: Clock },
  preparing: { label: "Planning", dotColor: "bg-amber-400 animate-pulse", textColor: "text-amber-400", icon: Cpu },
  generating: { label: "Generating", dotColor: "bg-blue-400 animate-pulse", textColor: "text-blue-400", icon: Sparkles },
  "post-processing": { label: "Finishing", dotColor: "bg-violet-400 animate-pulse", textColor: "text-violet-400", icon: Activity },
  completed: { label: "Completed", dotColor: "bg-emerald-500", textColor: "text-emerald-400", icon: CheckCircle2 },
  failed: { label: "Failed", dotColor: "bg-red-400", textColor: "text-red-400", icon: XCircle },
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

  const StatusIcon = selectedJob ? (STATUS_CONFIG[selectedJob.status]?.icon || Activity) : Activity;

  const detailContent = selectedJob && (
    <div className="space-y-5">
      {selectedJob.output?.url && selectedJob.status === "completed" && (
        <div className="rounded-lg overflow-hidden border border-[rgba(255,255,255,0.06)] bg-black">
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
        <label className="section-label mb-1.5">Status</label>
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-3.5 h-3.5 ${STATUS_CONFIG[selectedJob.status]?.textColor || "text-virtue-text-muted"}`} strokeWidth={1.5} />
          <span className={`text-sm font-medium ${STATUS_CONFIG[selectedJob.status]?.textColor || "text-virtue-text-secondary"}`}>
            {STATUS_CONFIG[selectedJob.status]?.label || selectedJob.status}
          </span>
          <span className="text-xs text-virtue-text-muted ml-auto tabular-nums">{selectedJob.progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-[rgba(255,255,255,0.04)] mt-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              selectedJob.status === "completed" ? "bg-emerald-500"
                : selectedJob.status === "failed" ? "bg-red-500" : "bg-virtue-accent"
            }`}
            style={{ width: `${selectedJob.progress}%` }}
          />
        </div>
      </div>

      <div>
        <label className="section-label mb-1.5">Prompt</label>
        <p className="text-[13px] text-virtue-text-secondary leading-relaxed bg-[rgba(255,255,255,0.02)] rounded-md p-3 border border-[rgba(255,255,255,0.06)]">
          {selectedJob.prompt}
        </p>
      </div>

      {selectedJob.error && (
        <div>
          <label className="flex items-center gap-1.5 text-[10px] text-red-400/70 uppercase tracking-wider font-medium mb-1.5">
            <AlertTriangle className="w-3 h-3" strokeWidth={1.5} />
            Error
          </label>
          <p className="text-[13px] text-red-400 bg-red-950/20 rounded-md p-3 border border-red-900/30">{selectedJob.error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[rgba(255,255,255,0.02)] rounded-md p-3 border border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-1.5 mb-1">
            <Server className="w-3 h-3 text-virtue-text-muted" strokeWidth={1.5} />
            <p className="text-[10px] text-virtue-text-muted uppercase tracking-wider">Provider</p>
          </div>
          <p className="text-[13px] text-virtue-text font-mono">{selectedJob.provider}</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] rounded-md p-3 border border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-1.5 mb-1">
            <Hash className="w-3 h-3 text-virtue-text-muted" strokeWidth={1.5} />
            <p className="text-[10px] text-virtue-text-muted uppercase tracking-wider">Job ID</p>
          </div>
          <p className="text-[13px] text-virtue-text font-mono truncate">{selectedJob.id.slice(0, 12)}</p>
        </div>
      </div>

      {selectedJob.skills.length > 0 && (
        <div>
          <label className="flex items-center gap-1.5 section-label mb-1.5">
            <Layers className="w-3 h-3" strokeWidth={1.5} />
            Skills Used
          </label>
          <div className="flex flex-wrap gap-1.5">
            {selectedJob.skills.map((skill) => (
              <span key={skill} className="rounded bg-[rgba(255,255,255,0.04)] px-2 py-1 text-[11px] text-virtue-text-secondary font-mono border border-[rgba(255,255,255,0.06)]">
                {skill.replace("skill-", "")}
              </span>
            ))}
          </div>
        </div>
      )}

      {selectedJob.output && (
        <div>
          <label className="flex items-center gap-1.5 section-label mb-1.5">
            <Film className="w-3 h-3" strokeWidth={1.5} />
            Output
          </label>
          <div className="bg-[rgba(255,255,255,0.02)] rounded-md p-3 border border-[rgba(255,255,255,0.06)] space-y-1">
            <p className="text-[13px] text-virtue-text font-mono truncate">{selectedJob.output.filename}</p>
            <p className="text-[10px] text-virtue-text-muted truncate">{selectedJob.output.url}</p>
          </div>
        </div>
      )}

      {!isTerminal(selectedJob.status) && selectedJob.provider === "mock" && (
        <button
          onClick={() => handlePoll(selectedJob.id)}
          className="w-full glass-card flex items-center justify-center gap-2 py-3 text-[15px] font-medium text-virtue-accent transition-all hover:bg-[rgba(255,255,255,0.06)] active:scale-[0.98] touch-manipulation"
        >
          <FastForward className="w-4 h-4" strokeWidth={1.5} />
          Advance Pipeline
        </button>
      )}

      {!isTerminal(selectedJob.status) && selectedJob.provider !== "mock" && (
        <div className="flex items-center gap-2 text-xs text-virtue-text-muted">
          <Activity className="w-3 h-3 text-virtue-accent animate-pulse" strokeWidth={1.5} />
          Auto-polling... checking every 5s
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full animate-fade-in">
      <div className="flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10 space-y-5 sm:space-y-7">
        {/* Page header */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[rgba(76,125,255,0.1)] border border-[rgba(76,125,255,0.15)]">
              <Clapperboard className="w-4.5 h-4.5 text-virtue-accent" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-section sm:text-[28px] font-semibold tracking-tight text-virtue-text">
                Render Queue
              </h1>
              <p className="text-meta text-virtue-text-muted mt-0.5">
                {jobs.length} job{jobs.length !== 1 ? "s" : ""} total
              </p>
            </div>
          </div>
        </div>

        {/* Filter tabs — horizontally scrollable on mobile, glass styled */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0">
          {FILTER_OPTIONS.map((opt) => {
            const count = counts[opt.value];
            if (opt.value !== "all" && count === 0) return null;
            return (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`rounded-lg px-3.5 py-2 sm:py-1.5 text-[13px] sm:text-xs transition-all shrink-0 touch-manipulation border ${
                  filter === opt.value
                    ? "bg-[rgba(76,125,255,0.1)] border-[rgba(76,125,255,0.2)] text-virtue-accent font-medium"
                    : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-virtue-text-muted hover:text-virtue-text-secondary hover:bg-[rgba(255,255,255,0.04)]"
                }`}
              >
                {opt.label}
                {count > 0 && (
                  <span className={`ml-1.5 ${filter === opt.value ? "text-virtue-accent/60" : "text-virtue-text-muted"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Job list */}
        {filtered.length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <Film className="w-8 h-8 text-virtue-text-muted mx-auto mb-3" strokeWidth={1} />
            <p className="text-virtue-text-muted text-sm">No render jobs to show.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((job) => (
              <RenderProgressCard key={job.id} job={job} onClick={() => handleSelect(job)} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop detail side panel */}
      {selectedJob && (
        <div className="hidden lg:block w-96 glass-panel border-l border-[rgba(255,255,255,0.06)] rounded-none overflow-y-auto shrink-0">
          <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
            <h2 className="section-label">Job Detail</h2>
            <button
              onClick={() => { setSelectedJob(null); setShowDetail(false); }}
              className="text-virtue-text-muted hover:text-virtue-text transition-colors min-h-[44px] flex items-center"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
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
