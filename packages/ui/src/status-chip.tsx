import React from "react";
import { cn } from "./utils";

const statusColors: Record<string, string> = {
  queued: "bg-zinc-700 text-zinc-300",
  preparing: "bg-amber-900/60 text-amber-300",
  generating: "bg-blue-900/60 text-blue-300",
  "post-processing": "bg-purple-900/60 text-purple-300",
  completed: "bg-emerald-900/60 text-emerald-300",
  failed: "bg-red-900/60 text-red-300",
};

export function StatusChip({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase",
        statusColors[status] || "bg-zinc-800 text-zinc-400"
      )}
    >
      {status}
    </span>
  );
}
