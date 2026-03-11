import React from "react";
import { cn } from "./utils";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  elevated?: boolean;
}

export function Panel({ children, className, title, elevated }: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-panel border backdrop-blur-panel",
        elevated
          ? "bg-[rgba(255,255,255,0.035)] border-[rgba(255,255,255,0.1)] shadow-panel-hover"
          : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] shadow-panel",
        className
      )}
    >
      {title && (
        <div className="border-b border-[rgba(255,255,255,0.06)] px-5 py-3.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#666]">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
