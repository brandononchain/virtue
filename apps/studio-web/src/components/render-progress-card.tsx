"use client";

import type { VirtueRenderJob } from "@virtue/types";

const STATUS_STYLES: Record<string, { dot: string; text: string; bar: string; bg: string }> = {
  queued: { dot: "bg-zinc-500", text: "text-zinc-400", bar: "bg-zinc-500", bg: "" },
  preparing: { dot: "bg-amber-400 animate-pulse", text: "text-amber-400", bar: "bg-amber-500", bg: "border-amber-900/30" },
  generating: { dot: "bg-blue-400 animate-pulse", text: "text-blue-400", bar: "bg-blue-500", bg: "border-blue-900/30" },
  "post-processing": { dot: "bg-violet-400 animate-pulse", text: "text-violet-400", bar: "bg-violet-500", bg: "border-violet-900/30" },
  completed: { dot: "bg-emerald-500", text: "text-emerald-400", bar: "bg-emerald-500", bg: "border-emerald-900/30" },
  failed: { dot: "bg-red-400", text: "text-red-400", bar: "bg-red-500", bg: "border-red-900/30" },
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
      className={`w-full text-left studio-panel p-4 transition-all active:scale-[0.98] touch-manipulation ${styles.bg}`}
    >
      <div className="flex items-start gap-3">
        <span className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 ${styles.dot}`} />
        <div className="flex-1 min-w-0">
          <p className={`${compact ? "text-[13px]" : "text-[14px]"} text-zinc-300 ${compact ? "truncate" : "line-clamp-2"}`}>
            {job.prompt}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-zinc-700 font-mono">{job.id.slice(0, 8)}</span>
            <span className="text-[10px] text-zinc-600 font-mono uppercase">{job.provider}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[10px] font-medium uppercase tracking-wide ${styles.text}`}>
            {job.status.replace("-", " ")}
          </span>
          <span className="text-[10px] text-zinc-600 tabular-nums">{job.progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${styles.bar}`}
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </div>
    </button>
  );
}
