import React from "react";
import { cn } from "./utils";

const statusStyles: Record<string, { dot: string; text: string; bg: string }> = {
  queued: { dot: "bg-[#666]", text: "text-[#999]", bg: "bg-[rgba(255,255,255,0.03)]" },
  preparing: { dot: "bg-amber-400 animate-pulse", text: "text-amber-400", bg: "bg-amber-500/5" },
  generating: { dot: "bg-[#4C7DFF] animate-pulse", text: "text-[#4C7DFF]", bg: "bg-[rgba(76,125,255,0.06)]" },
  "post-processing": { dot: "bg-[#8B7CFF] animate-pulse", text: "text-[#8B7CFF]", bg: "bg-[rgba(139,124,255,0.06)]" },
  completed: { dot: "bg-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/5" },
  failed: { dot: "bg-red-400", text: "text-red-400", bg: "bg-red-500/5" },
};

export function StatusChip({ status }: { status: string }) {
  const style = statusStyles[status] || statusStyles.queued;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase",
        style.bg,
        style.text
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {status.replace("-", " ")}
    </span>
  );
}
