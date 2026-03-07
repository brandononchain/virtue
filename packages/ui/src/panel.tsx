import React from "react";
import { cn } from "./utils";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Panel({ children, className, title }: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-800 bg-zinc-950/80 backdrop-blur",
        className
      )}
    >
      {title && (
        <div className="border-b border-zinc-800 px-4 py-3">
          <h3 className="text-sm font-semibold tracking-wide text-zinc-300 uppercase">
            {title}
          </h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
