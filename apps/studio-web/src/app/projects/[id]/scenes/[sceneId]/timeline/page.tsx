"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { BottomSheet } from "@/components/bottom-sheet";
import type {
  VirtueProject,
  VirtueScene,
  VirtueShot,
  VirtueRenderJob,
  SceneTimeline,
  SceneRenderJob,
  TimelineShot,
} from "@virtue/types";

export default function SceneTimelinePage() {
  const { id: projectId, sceneId } = useParams<{
    id: string;
    sceneId: string;
  }>();

  const [project, setProject] = useState<VirtueProject | null>(null);
  const [scene, setScene] = useState<VirtueScene | null>(null);
  const [timeline, setTimeline] = useState<SceneTimeline | null>(null);
  const [renderJobs, setRenderJobs] = useState<VirtueRenderJob[]>([]);
  const [composeJob, setComposeJob] = useState<SceneRenderJob | null>(null);
  const [composing, setComposing] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!projectId || !sceneId) return;
    api.getProject(projectId).then((p) => {
      setProject(p);
      const s = p.scenes.find((sc) => sc.id === sceneId);
      if (s) setScene(s);
    });
    api.listRenders(projectId).then(setRenderJobs);
    api.getSceneTimeline(projectId, sceneId).then(setTimeline);
  }, [projectId, sceneId]);

  const refreshTimeline = useCallback(async () => {
    if (!projectId || !sceneId) return;
    const tl = await api.createSceneTimeline(projectId, sceneId);
    setTimeline(tl);
  }, [projectId, sceneId]);

  function getShotRender(shotId: string): VirtueRenderJob | undefined {
    return renderJobs.find((j) => j.shotId === shotId && j.status === "completed" && j.output);
  }

  function getShotDetails(shotId: string): VirtueShot | undefined {
    return scene?.shots.find((s) => s.id === shotId);
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDropIndex(index);
  }

  async function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index || !timeline || !projectId || !sceneId) {
      setDragIndex(null);
      setDropIndex(null);
      return;
    }
    const order = [...timeline.shots.map((s) => s.shotId)];
    const [moved] = order.splice(dragIndex, 1);
    order.splice(index, 0, moved);
    const updated = await api.reorderTimeline(projectId, sceneId, order);
    setTimeline(updated);
    setDragIndex(null);
    setDropIndex(null);
  }

  async function handleCompose() {
    if (!projectId || !sceneId) return;
    setComposing(true);
    try {
      const job = await api.composeScene(projectId, sceneId);
      setComposeJob(job);
      pollComposition(job.id);
    } catch (err) {
      setComposeJob({
        id: "error",
        projectId: projectId!,
        sceneId: sceneId!,
        timelineId: timeline?.id || "",
        status: "failed",
        progress: 0,
        shotCount: 0,
        error: err instanceof Error ? err.message : "Failed to start composition",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setComposing(false);
    }
  }

  function pollComposition(jobId: string) {
    const interval = setInterval(async () => {
      try {
        const job = await api.pollSceneComposition(jobId);
        setComposeJob(job);
        if (job.status === "completed" || job.status === "failed") {
          clearInterval(interval);
          setComposing(false);
        }
      } catch {
        clearInterval(interval);
        setComposing(false);
      }
    }, 2000);
  }

  if (!project || !scene) {
    return (
      <div className="p-4 sm:p-8">
        <p className="text-virtue-text-muted text-sm">Loading scene timeline...</p>
      </div>
    );
  }

  const allRendered = timeline
    ? timeline.shots.length > 0 && timeline.shots.every((s) => s.renderAssetId)
    : false;

  const renderedCount = timeline
    ? timeline.shots.filter((s) => s.renderAssetId).length
    : 0;

  const composeContent = (
    <div className="space-y-5">
      <div>
        <label className="section-label">Scene</label>
        <p className="text-[14px] sm:text-sm text-virtue-text-secondary">{scene.title}</p>
        {scene.description && <p className="text-[13px] sm:text-xs text-virtue-text-muted mt-1">{scene.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-panel p-3">
          <p className="text-[9px] text-virtue-text-muted uppercase">Shots</p>
          <p className="text-lg font-bold text-virtue-text tabular-nums">{timeline?.shots.length || 0}</p>
        </div>
        <div className="glass-panel p-3">
          <p className="text-[9px] text-virtue-text-muted uppercase">Duration</p>
          <p className="text-lg font-bold text-virtue-text tabular-nums">{(timeline?.totalDuration || 0).toFixed(1)}s</p>
        </div>
        <div className="glass-panel p-3">
          <p className="text-[9px] text-virtue-text-muted uppercase">Rendered</p>
          <p className="text-lg font-bold text-virtue-text tabular-nums">{renderedCount}</p>
        </div>
        <div className="glass-panel p-3">
          <p className="text-[9px] text-virtue-text-muted uppercase">Ready</p>
          <p className={`text-lg font-bold tabular-nums ${allRendered ? "text-emerald-400" : "text-virtue-text-muted"}`}>
            {allRendered ? "Yes" : "No"}
          </p>
        </div>
      </div>

      <button
        onClick={handleCompose}
        disabled={!allRendered || composing}
        className="btn-primary w-full py-3 text-[15px] sm:text-sm font-medium active:scale-[0.98] touch-manipulation"
      >
        {composing ? "Composing..." : allRendered ? "Compose Scene" : "Render all shots first"}
      </button>

      {!allRendered && timeline && timeline.shots.length > 0 && (
        <p className="text-[12px] sm:text-[10px] text-virtue-text-muted text-center">
          {timeline.shots.length - renderedCount} shot{timeline.shots.length - renderedCount !== 1 ? "s" : ""} still need rendering
        </p>
      )}

      {composeJob && (
        <div>
          <label className="section-label">Composition Status</label>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`h-2 w-2 rounded-full shrink-0 ${
              composeJob.status === "completed" ? "bg-emerald-500" : composeJob.status === "failed" ? "bg-red-400" : "bg-blue-400 animate-pulse"
            }`} />
            <span className={`text-[13px] sm:text-xs font-medium uppercase ${
              composeJob.status === "completed" ? "text-emerald-400" : composeJob.status === "failed" ? "text-red-400" : "text-blue-400"
            }`}>
              {composeJob.status}
            </span>
            <span className="text-xs text-virtue-text-muted ml-auto tabular-nums">{composeJob.progress}%</span>
          </div>
          <div className="h-2 sm:h-1.5 rounded-full bg-[rgba(255,255,255,0.04)]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                composeJob.status === "completed" ? "bg-emerald-500" : composeJob.status === "failed" ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${composeJob.progress}%` }}
            />
          </div>
          {composeJob.error && <p className="text-[13px] sm:text-xs text-red-400 mt-1.5">{composeJob.error}</p>}
        </div>
      )}

      {composeJob?.output && composeJob.status === "completed" && (
        <div>
          <label className="section-label">Scene Output</label>
          <div className="rounded-lg overflow-hidden border border-[rgba(255,255,255,0.06)] bg-black">
            <video src={composeJob.output.url} controls autoPlay loop muted playsInline className="w-full aspect-video" />
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-[11px] text-virtue-text-muted font-mono truncate">{composeJob.output.filename}</p>
            <p className="text-[10px] text-virtue-text-muted font-mono truncate">{composeJob.output.url}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-4 sm:px-6 py-3 bg-virtue-bg">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href={`/projects/${projectId}`}
            className="text-xs text-virtue-text-muted hover:text-virtue-text-secondary transition-colors shrink-0 min-h-[44px] flex items-center"
          >
            <span className="hidden sm:inline">{project.name}</span>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 sm:hidden">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </Link>
          <span className="text-virtue-text-muted hidden sm:inline">/</span>
          <h1 className="text-sm font-semibold text-virtue-text truncate">{scene.title}</h1>
          <span className="rounded bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[9px] text-virtue-text-muted font-mono uppercase hidden sm:inline">Timeline</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href={`/projects/${projectId}/scenes/${sceneId}/editor`}
            className="rounded-md bg-virtue-accent px-3 py-2 sm:py-1 text-[11px] sm:text-[10px] font-semibold text-white uppercase tracking-wider hover:bg-virtue-accent/90 transition-colors touch-manipulation"
          >
            Editor
          </Link>
          <button
            onClick={refreshTimeline}
            className="text-[10px] text-virtue-text-muted hover:text-virtue-text-secondary uppercase tracking-wider transition-colors min-h-[44px] flex items-center"
          >
            Refresh
          </button>
          {/* Compose button — mobile */}
          <button
            onClick={() => setShowCompose(true)}
            className="lg:hidden rounded-md border border-[rgba(255,255,255,0.08)] px-3 py-2 text-[11px] text-virtue-text-secondary font-medium touch-manipulation"
          >
            Compose
          </button>
          <span className="text-[10px] text-virtue-text-muted tabular-nums hidden sm:inline">
            {renderedCount}/{timeline?.shots.length || 0} rendered
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Timeline panel */}
        <div className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-[rgba(255,255,255,0.04)] bg-virtue-bg px-4 sm:px-6 py-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-virtue-text-muted font-mono uppercase tracking-widest">Scene Timeline</span>
              <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
              {scene.location && <span className="text-[9px] text-virtue-text-muted hidden sm:inline">{scene.location}</span>}
              {scene.mood && <span className="text-[9px] text-virtue-text-muted hidden sm:inline">{scene.mood}</span>}
              {/* Mobile stats */}
              <span className="text-[9px] text-virtue-text-muted tabular-nums sm:hidden">
                {renderedCount}/{timeline?.shots.length || 0}
              </span>
            </div>
          </div>

          {/* Shot track — vertical list */}
          <div className="px-4 sm:px-6 py-4 space-y-1.5 sm:space-y-1">
            {(!timeline || timeline.shots.length === 0) && (
              <div className="text-center py-16">
                <p className="text-sm text-virtue-text-muted">No shots in this scene yet.</p>
                <Link href={`/projects/${projectId}`} className="text-xs text-virtue-text-muted hover:text-virtue-text-secondary mt-2 inline-block transition-colors">
                  Add shots in the project view
                </Link>
              </div>
            )}

            {timeline?.shots.map((tShot, index) => {
              const shot = getShotDetails(tShot.shotId);
              const render = getShotRender(tShot.shotId);
              const hasAsset = !!tShot.renderAssetId;
              const isDragging = dragIndex === index;
              const isDropTarget = dropIndex === index;

              return (
                <div
                  key={tShot.shotId}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={() => { setDragIndex(null); setDropIndex(null); }}
                  className={`
                    group rounded border transition-all cursor-grab active:cursor-grabbing touch-manipulation
                    ${isDragging ? "opacity-40 scale-[0.98]" : ""}
                    ${isDropTarget && !isDragging ? "border-virtue-accent/50" : "border-[rgba(255,255,255,0.06)]"}
                    ${hasAsset ? "bg-virtue-surface" : "bg-virtue-bg"}
                    hover:border-[rgba(255,255,255,0.1)]
                    flex flex-col sm:flex-row sm:items-stretch
                  `}
                >
                  {/* Index + duration */}
                  <div className="flex sm:flex-col items-center justify-between sm:justify-center w-full sm:w-14 shrink-0 border-b sm:border-b-0 sm:border-r border-[rgba(255,255,255,0.04)] px-4 sm:px-0 py-2 sm:py-3">
                    <div className="flex sm:flex-col items-center gap-2 sm:gap-0">
                      <span className="text-[10px] text-virtue-text-muted font-mono tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                      <span className="text-[9px] text-virtue-text-muted font-mono sm:mt-1 tabular-nums">{tShot.duration}s</span>
                    </div>
                    <span className={`h-2 w-2 rounded-full shrink-0 sm:hidden ${hasAsset ? "bg-emerald-500" : "bg-virtue-text-muted"}`} />
                  </div>

                  {/* Shot info */}
                  <div className="flex-1 min-w-0 py-3 px-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`h-2 w-2 rounded-full shrink-0 hidden sm:block ${hasAsset ? "bg-emerald-500" : "bg-virtue-text-muted"}`} />
                      {shot && (
                        <span className="rounded bg-[rgba(255,255,255,0.04)] px-1.5 py-0.5 text-[8px] text-virtue-text-muted font-mono uppercase shrink-0">
                          {shot.shotType}
                        </span>
                      )}
                      <span className="text-[13px] sm:text-xs text-virtue-text-secondary truncate">
                        {shot?.description || tShot.shotId}
                      </span>
                    </div>

                    {/* Timeline bar — desktop only */}
                    <div className="hidden sm:block relative h-6 rounded bg-[rgba(255,255,255,0.02)] overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 rounded ${
                          hasAsset ? "bg-emerald-900/40 border border-emerald-800/40" : "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]"
                        }`}
                        style={{ width: `${Math.min(100, (tShot.duration / (timeline?.totalDuration || 1)) * 100 * 2.5)}%` }}
                      >
                        <div className="flex items-center h-full px-2 gap-2">
                          {shot && <span className="text-[8px] text-virtue-text-muted font-mono truncate">{shot.cameraMove} · {shot.lens}</span>}
                        </div>
                      </div>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-virtue-text-muted font-mono tabular-nums">
                        {formatTimecode(tShot.startTime)} — {formatTimecode(tShot.startTime + tShot.duration)}
                      </span>
                    </div>

                    {/* Mobile meta */}
                    <div className="sm:hidden flex items-center gap-2 mt-1">
                      {shot && <span className="text-[11px] text-virtue-text-muted font-mono">{shot.cameraMove} · {shot.lens}</span>}
                    </div>
                  </div>

                  {/* Render status — desktop */}
                  <div className="hidden sm:flex items-center justify-center w-24 shrink-0 border-l border-[rgba(255,255,255,0.04)] px-2">
                    {hasAsset ? (
                      <span className="text-[9px] text-emerald-500 font-mono uppercase">Rendered</span>
                    ) : render ? (
                      <span className="text-[9px] text-blue-400 font-mono uppercase">{render.status}</span>
                    ) : (
                      <span className="text-[9px] text-virtue-text-muted font-mono uppercase">Pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop compose panel */}
        <div className="hidden lg:block w-80 border-l border-[rgba(255,255,255,0.06)] bg-virtue-bg overflow-y-auto shrink-0">
          <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
            <h2 className="text-[10px] font-semibold text-virtue-text-muted uppercase tracking-wider">Scene Composition</h2>
          </div>
          <div className="p-5">{composeContent}</div>
        </div>

        {/* Mobile compose bottom sheet */}
        <div className="lg:hidden">
          <BottomSheet open={showCompose} onClose={() => setShowCompose(false)} title="Scene Composition">
            {composeContent}
          </BottomSheet>
        </div>
      </div>
    </div>
  );
}

function formatTimecode(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
}
