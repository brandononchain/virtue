"use client";

import type { VirtueRenderJob } from "@virtue/types";

const STATUS_STYLES: Record<string, { dot: string; text: string; bar: string; border: string }> = {
  queued: { dot: "bg-virtue-text-muted", text: "text-virtue-text-muted", bar: "bg-virtue-text-muted", border: "" },
  preparing: { dot: "bg-amber-400 status-pulse", text: "text-amber-400", bar: "bg-amber-500", border: "border-amber-500/10" },
  generating: { dot: "bg-virtue-accent status-pulse", text: "text-virtue-accent", bar: "bg-virtue-accent", border: "border-virtue-accent/10" },
  "post-processing": { dot: "bg-virtue-accent-secondary status-pulse", text: "text-virtue-accent-secondary", bar: "bg-virtue-accent-secondary", border: "border-virtue-accent-secondary/10" },
  completed: { dot: "bg-emerald-500", text: "text-emerald-400", bar: "bg-emerald-500", border: "border-emerald-500/10" },
  failed: { dot: "bg-red-400", text: "text-red-400", bar: "bg-red-500", border: "border-red-500/10" },
};

interface RenderProgressCardProps {
  job: VirtueRenderJob;
  onClick?: () => void;
  compact?: boolean;
}

export function RenderProgressCard({ job, onClick, compact }: RenderProgressCardProps) {
  const styles = STATUS_STYLES[job.status] || STATUS_STYLES.queued;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left glass-card p-4 touch-manipulation ${styles.border}`}
    >
      <div className="flex items-start gap-3">
        <span className={`h-2 w-2 rounded-full shrink-0 mt-2 ${styles.dot}`} />
        <div className="flex-1 min-w-0">
          <p className={`${compact ? "text-[13px]" : "text-[14px]"} text-virtue-text ${compact ? "truncate" : "line-clamp-2"}`}>
            {job.prompt}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-virtue-text-muted/50 font-mono">{job.id.slice(0, 8)}</span>
            <span className="text-[10px] text-virtue-text-muted font-mono uppercase">{job.provider}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${styles.text}`}>
            {job.status.replace("-", " ")}
          </span>
          <span className="text-[10px] text-virtue-text-muted tabular-nums font-mono">{job.progress}%</span>
        </div>
        <div className="h-1 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${styles.bar}`}
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </div>
    </button>
  );
}
