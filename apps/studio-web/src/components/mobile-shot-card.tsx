"use client";

import type { VirtueShot } from "@virtue/types";

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
      className={`studio-panel p-4 transition-all touch-manipulation ${
        isDragging ? "opacity-40 scale-[0.98]" : ""
      } ${isDropTarget && !isDragging ? "border-amber-600/60" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle + index */}
        <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
          <span className="text-[10px] text-zinc-600 font-mono tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          {onDragStart && (
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-zinc-700">
              <circle cx="6" cy="4" r="1.5" />
              <circle cx="10" cy="4" r="1.5" />
              <circle cx="6" cy="8" r="1.5" />
              <circle cx="10" cy="8" r="1.5" />
              <circle cx="6" cy="12" r="1.5" />
              <circle cx="10" cy="12" r="1.5" />
            </svg>
          )}
        </div>

        {/* Thumbnail placeholder */}
        <div className={`w-20 h-14 rounded-md shrink-0 flex items-center justify-center ${
          hasRender ? "bg-emerald-950/30 border border-emerald-800/40" : "bg-zinc-800/60"
        }`}>
          {hasRender ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-emerald-500">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-zinc-600">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-500 font-mono uppercase shrink-0">
              {shot.shotType}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">{shot.durationSec}s</span>
          </div>
          <p className="text-[13px] text-zinc-300 leading-snug line-clamp-2">
            {shot.description || "No description"}
          </p>
          <p className="text-[12px] text-zinc-600 mt-1 truncate">
            {shot.prompt}
          </p>
        </div>
      </div>

      {/* Bottom meta */}
      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-zinc-800/30">
        <span className="text-[10px] text-zinc-600 font-mono">{shot.cameraMove}</span>
        <span className="text-zinc-800">|</span>
        <span className="text-[10px] text-zinc-600 font-mono">{shot.lens}</span>
        {shot.lighting && (
          <>
            <span className="text-zinc-800">|</span>
            <span className="text-[10px] text-zinc-600 font-mono">{shot.lighting}</span>
          </>
        )}
        <span className={`ml-auto text-[10px] font-medium uppercase ${
          hasRender ? "text-emerald-500" : "text-zinc-600"
        }`}>
          {hasRender ? "Rendered" : "Pending"}
        </span>
      </div>
    </div>
  );
}
