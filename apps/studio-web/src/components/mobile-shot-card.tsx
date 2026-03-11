"use client";

import type { VirtueShot } from "@virtue/types";
import { GripVertical, Check, Video } from "lucide-react";

interface MobileShotCardProps {
  shot: VirtueShot;
  index: number;
  hasRender?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  isDropTarget?: boolean;
}

export function MobileShotCard({
  shot,
  index,
  hasRender,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isDropTarget,
}: MobileShotCardProps) {
  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`glass-card p-4 transition-all touch-manipulation ${
        isDragging ? "opacity-40 scale-[0.98]" : ""
      } ${isDropTarget && !isDragging ? "border-virtue-accent/40" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle + index */}
        <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
          <span className="text-[10px] text-virtue-text-muted font-mono tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          {onDragStart && (
            <GripVertical className="w-3.5 h-3.5 text-virtue-text-muted/40" />
          )}
        </div>

        {/* Thumbnail placeholder */}
        <div className={`w-20 h-14 rounded-lg shrink-0 flex items-center justify-center ${
          hasRender
            ? "bg-emerald-500/5 border border-emerald-500/20"
            : "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)]"
        }`}>
          {hasRender ? (
            <Check className="w-4 h-4 text-emerald-500" strokeWidth={2} />
          ) : (
            <Video className="w-4 h-4 text-virtue-text-muted/40" strokeWidth={1.5} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-[rgba(255,255,255,0.04)] px-1.5 py-0.5 text-[10px] text-virtue-text-secondary font-mono uppercase shrink-0 border border-[rgba(255,255,255,0.04)]">
              {shot.shotType}
            </span>
            <span className="text-[11px] text-virtue-text-muted font-mono">{shot.durationSec}s</span>
          </div>
          <p className="text-[13px] text-virtue-text leading-snug line-clamp-2">
            {shot.description || "No description"}
          </p>
          <p className="text-[12px] text-virtue-text-muted mt-1 truncate">
            {shot.prompt}
          </p>
        </div>
      </div>

      {/* Bottom meta */}
      <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-[rgba(255,255,255,0.04)]">
        <span className="text-[10px] text-virtue-text-muted font-mono">{shot.cameraMove}</span>
        <span className="text-[rgba(255,255,255,0.08)]">&middot;</span>
        <span className="text-[10px] text-virtue-text-muted font-mono">{shot.lens}</span>
        {shot.lighting && (
          <>
            <span className="text-[rgba(255,255,255,0.08)]">&middot;</span>
            <span className="text-[10px] text-virtue-text-muted font-mono">{shot.lighting}</span>
          </>
        )}
        <span className={`ml-auto text-[10px] font-semibold uppercase tracking-wider ${
          hasRender ? "text-emerald-500" : "text-virtue-text-muted/50"
        }`}>
          {hasRender ? "Rendered" : "Pending"}
        </span>
      </div>
    </div>
  );
}
