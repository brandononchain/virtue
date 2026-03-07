"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
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
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // Load data
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

  // Refresh timeline
  const refreshTimeline = useCallback(async () => {
    if (!projectId || !sceneId) return;
    const tl = await api.createSceneTimeline(projectId, sceneId);
    setTimeline(tl);
  }, [projectId, sceneId]);

  // Get render job for a shot
  function getShotRender(shotId: string): VirtueRenderJob | undefined {
    return renderJobs.find(
      (j) => j.shotId === shotId && j.status === "completed" && j.output
    );
  }

  // Get shot details from scene
  function getShotDetails(shotId: string): VirtueShot | undefined {
    return scene?.shots.find((s) => s.id === shotId);
  }

  // Handle drag reorder
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

  // Compose scene
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
      <div className="p-8">
        <p className="text-zinc-500 text-sm">Loading scene timeline...</p>
      </div>
    );
  }

  const allRendered = timeline
    ? timeline.shots.length > 0 &&
      timeline.shots.every((s) => s.renderAssetId)
    : false;

  const renderedCount = timeline
    ? timeline.shots.filter((s) => s.renderAssetId).length
    : 0;

  return (
    <div className="flex h-full flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-6 py-3 bg-[#080808]">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}`}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            {project.name}
          </Link>
          <span className="text-zinc-700">/</span>
          <h1 className="text-sm font-semibold text-zinc-200">
            {scene.title}
          </h1>
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-[9px] text-zinc-500 font-mono uppercase">
            Timeline
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}/scenes/${sceneId}/editor`}
            className="rounded-md bg-amber-600/90 px-3 py-1 text-[10px] font-semibold text-white uppercase tracking-wider hover:bg-amber-500 transition-colors"
          >
            Open Editor
          </Link>
          <button
            onClick={refreshTimeline}
            className="text-[10px] text-zinc-500 hover:text-zinc-300 uppercase tracking-wider transition-colors"
          >
            Refresh
          </button>
          <span className="text-[10px] text-zinc-600 tabular-nums">
            {renderedCount}/{timeline?.shots.length || 0} rendered
          </span>
          {timeline && (
            <span className="text-[10px] text-zinc-600 tabular-nums">
              {timeline.totalDuration.toFixed(1)}s total
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Timeline panel */}
        <div className="flex-1 overflow-y-auto">
          {/* Timecode ruler */}
          <div className="sticky top-0 z-10 border-b border-zinc-800/40 bg-[#0a0a0a] px-6 py-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">
                Scene Timeline
              </span>
              <div className="flex-1 h-px bg-zinc-800/60" />
              {scene.location && (
                <span className="text-[9px] text-zinc-700">
                  {scene.location}
                </span>
              )}
              {scene.mood && (
                <span className="text-[9px] text-zinc-700">{scene.mood}</span>
              )}
            </div>
          </div>

          {/* Shot track — vertical list resembling an NLE */}
          <div className="px-6 py-4 space-y-1">
            {(!timeline || timeline.shots.length === 0) && (
              <div className="text-center py-16">
                <p className="text-sm text-zinc-600">
                  No shots in this scene yet.
                </p>
                <Link
                  href={`/projects/${projectId}`}
                  className="text-xs text-zinc-500 hover:text-zinc-300 mt-2 inline-block transition-colors"
                >
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
                  onDragEnd={() => {
                    setDragIndex(null);
                    setDropIndex(null);
                  }}
                  className={`
                    group flex items-stretch rounded border transition-all cursor-grab active:cursor-grabbing
                    ${isDragging ? "opacity-40 scale-[0.98]" : ""}
                    ${isDropTarget && !isDragging ? "border-zinc-500" : "border-zinc-800/60"}
                    ${hasAsset ? "bg-[#0c0c0c]" : "bg-[#0a0a0a]"}
                    hover:border-zinc-700/80
                  `}
                >
                  {/* Index + duration bar */}
                  <div className="flex flex-col items-center justify-center w-14 shrink-0 border-r border-zinc-800/40 py-3">
                    <span className="text-[10px] text-zinc-600 font-mono tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] text-zinc-700 font-mono mt-1 tabular-nums">
                      {tShot.duration}s
                    </span>
                  </div>

                  {/* Duration bar (visual width proportional to duration) */}
                  <div className="flex-1 min-w-0 py-3 px-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      {/* Status indicator */}
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          hasAsset
                            ? "bg-emerald-500"
                            : "bg-zinc-600"
                        }`}
                      />
                      {/* Shot type badge */}
                      {shot && (
                        <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[8px] text-zinc-500 font-mono uppercase shrink-0">
                          {shot.shotType}
                        </span>
                      )}
                      {/* Description */}
                      <span className="text-xs text-zinc-400 truncate">
                        {shot?.description || tShot.shotId}
                      </span>
                    </div>

                    {/* Timeline bar */}
                    <div className="relative h-6 rounded bg-zinc-900 overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 rounded ${
                          hasAsset
                            ? "bg-emerald-900/40 border border-emerald-800/40"
                            : "bg-zinc-800/60 border border-zinc-700/30"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (tShot.duration / (timeline?.totalDuration || 1)) * 100 * 2.5
                          )}%`,
                        }}
                      >
                        <div className="flex items-center h-full px-2 gap-2">
                          {shot && (
                            <span className="text-[8px] text-zinc-500 font-mono truncate">
                              {shot.cameraMove} · {shot.lens}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Timecode overlay */}
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-zinc-700 font-mono tabular-nums">
                        {formatTimecode(tShot.startTime)} —{" "}
                        {formatTimecode(tShot.startTime + tShot.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Render status */}
                  <div className="flex items-center justify-center w-24 shrink-0 border-l border-zinc-800/40 px-2">
                    {hasAsset ? (
                      <span className="text-[9px] text-emerald-500 font-mono uppercase">
                        Rendered
                      </span>
                    ) : render ? (
                      <span className="text-[9px] text-blue-400 font-mono uppercase">
                        {render.status}
                      </span>
                    ) : (
                      <span className="text-[9px] text-zinc-600 font-mono uppercase">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel — compose controls + output */}
        <div className="w-80 border-l border-zinc-800/60 bg-[#080808] overflow-y-auto shrink-0">
          <div className="px-5 py-4 border-b border-zinc-800/60">
            <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Scene Composition
            </h2>
          </div>

          <div className="p-5 space-y-5">
            {/* Scene info */}
            <div>
              <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                Scene
              </label>
              <p className="text-sm text-zinc-300">{scene.title}</p>
              {scene.description && (
                <p className="text-xs text-zinc-500 mt-1">
                  {scene.description}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="studio-panel p-3">
                <p className="text-[9px] text-zinc-600 uppercase">Shots</p>
                <p className="text-lg font-bold text-zinc-100 tabular-nums">
                  {timeline?.shots.length || 0}
                </p>
              </div>
              <div className="studio-panel p-3">
                <p className="text-[9px] text-zinc-600 uppercase">Duration</p>
                <p className="text-lg font-bold text-zinc-100 tabular-nums">
                  {(timeline?.totalDuration || 0).toFixed(1)}s
                </p>
              </div>
              <div className="studio-panel p-3">
                <p className="text-[9px] text-zinc-600 uppercase">Rendered</p>
                <p className="text-lg font-bold text-zinc-100 tabular-nums">
                  {renderedCount}
                </p>
              </div>
              <div className="studio-panel p-3">
                <p className="text-[9px] text-zinc-600 uppercase">Ready</p>
                <p
                  className={`text-lg font-bold tabular-nums ${
                    allRendered ? "text-emerald-400" : "text-zinc-500"
                  }`}
                >
                  {allRendered ? "Yes" : "No"}
                </p>
              </div>
            </div>

            {/* Compose button */}
            <button
              onClick={handleCompose}
              disabled={!allRendered || composing}
              className="w-full rounded-md bg-zinc-100 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {composing
                ? "Composing..."
                : allRendered
                  ? "Compose Scene"
                  : "Render all shots first"}
            </button>

            {!allRendered && timeline && timeline.shots.length > 0 && (
              <p className="text-[10px] text-zinc-600 text-center">
                {timeline.shots.length - renderedCount} shot
                {timeline.shots.length - renderedCount !== 1 ? "s" : ""} still
                need rendering
              </p>
            )}

            {/* Composition progress */}
            {composeJob && (
              <div>
                <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                  Composition Status
                </label>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      composeJob.status === "completed"
                        ? "bg-emerald-500"
                        : composeJob.status === "failed"
                          ? "bg-red-400"
                          : "bg-blue-400 animate-pulse"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium uppercase ${
                      composeJob.status === "completed"
                        ? "text-emerald-400"
                        : composeJob.status === "failed"
                          ? "text-red-400"
                          : "text-blue-400"
                    }`}
                  >
                    {composeJob.status}
                  </span>
                  <span className="text-xs text-zinc-600 ml-auto tabular-nums">
                    {composeJob.progress}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-800">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      composeJob.status === "completed"
                        ? "bg-emerald-500"
                        : composeJob.status === "failed"
                          ? "bg-red-500"
                          : "bg-blue-500"
                    }`}
                    style={{ width: `${composeJob.progress}%` }}
                  />
                </div>
                {composeJob.error && (
                  <p className="text-xs text-red-400 mt-1.5">
                    {composeJob.error}
                  </p>
                )}
              </div>
            )}

            {/* Output video */}
            {composeJob?.output && composeJob.status === "completed" && (
              <div>
                <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                  Scene Output
                </label>
                <div className="rounded-lg overflow-hidden border border-zinc-800/60 bg-black">
                  <video
                    src={composeJob.output.url}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full aspect-video"
                  />
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-[10px] text-zinc-500 font-mono truncate">
                    {composeJob.output.filename}
                  </p>
                  <p className="text-[10px] text-zinc-600 font-mono truncate">
                    {composeJob.output.url}
                  </p>
                </div>
              </div>
            )}
          </div>
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
