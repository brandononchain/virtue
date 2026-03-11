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
  VirtueEditorTimeline,
  VirtueExportJob,
  EditorTimelineShot,
  VirtueAudioTrack,
} from "@virtue/types";

const TRANSITION_OPTIONS = [
  { value: "cut", label: "Cut", icon: "—" },
  { value: "fade", label: "Fade", icon: "◐" },
  { value: "cross-dissolve", label: "Cross Dissolve", icon: "◑" },
] as const;

const PACING_PRESETS = [
  { value: "cinematic", label: "Cinematic", desc: "Smooth dissolves, natural pacing" },
  { value: "slow-burn", label: "Slow Burn", desc: "Long fades, extended durations" },
  { value: "fast-cut", label: "Fast Cut", desc: "Hard cuts, compressed timing" },
  { value: "trailer", label: "Trailer", desc: "Punchy, rapid-fire cuts" },
] as const;

type MobileTab = "shots" | "transitions" | "audio" | "pacing" | "export";

export default function SceneEditorPage() {
  const { id: projectId, sceneId } = useParams<{ id: string; sceneId: string }>();

  const [project, setProject] = useState<VirtueProject | null>(null);
  const [scene, setScene] = useState<VirtueScene | null>(null);
  const [timeline, setTimeline] = useState<VirtueEditorTimeline | null>(null);
  const [renderJobs, setRenderJobs] = useState<VirtueRenderJob[]>([]);
  const [exportJob, setExportJob] = useState<VirtueExportJob | null>(null);
  const [exporting, setExporting] = useState(false);
  const [activePanel, setActivePanel] = useState<"transitions" | "audio" | "pacing">("transitions");
  const [mobileTab, setMobileTab] = useState<MobileTab>("shots");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const [addingTrack, setAddingTrack] = useState<"music" | "voiceover" | "sfx" | null>(null);
  const [trackAssetId, setTrackAssetId] = useState("");
  const [trackLabel, setTrackLabel] = useState("");
  const [trackStartTime, setTrackStartTime] = useState(0);

  useEffect(() => {
    if (!projectId || !sceneId) return;
    api.getProject(projectId).then((p) => {
      setProject(p);
      setScene(p.scenes.find((sc) => sc.id === sceneId) || null);
    });
    api.listRenders(projectId).then(setRenderJobs);
    api.getEditorTimeline(projectId, sceneId).then(setTimeline);
  }, [projectId, sceneId]);

  const refreshTimeline = useCallback(async () => {
    if (!projectId || !sceneId) return;
    const tl = await api.createEditorTimeline(projectId, sceneId);
    setTimeline(tl);
  }, [projectId, sceneId]);

  function getShotDetails(shotId: string): VirtueShot | undefined {
    return scene?.shots.find((s) => s.id === shotId);
  }

  async function handleSetTransition(shotId: string, type: "cut" | "fade" | "cross-dissolve", durationSec: number) {
    if (!projectId || !sceneId) return;
    const updated = await api.addEditorTransition(projectId, sceneId, shotId, {
      type,
      durationSec: type === "cut" ? 0 : durationSec,
    });
    setTimeline(updated);
  }

  async function handlePacingPreset(preset: string) {
    if (!projectId || !sceneId) return;
    const updated = await api.applyPacingPreset(projectId, sceneId, preset);
    setTimeline(updated);
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
    const updated = await api.reorderEditorShots(projectId, sceneId, order);
    setTimeline(updated);
    setDragIndex(null);
    setDropIndex(null);
  }

  async function handleAddAudioTrack() {
    if (!projectId || !sceneId || !addingTrack || !trackAssetId) return;
    const updated = await api.addAudioTrack(projectId, sceneId, {
      type: addingTrack,
      assetId: trackAssetId,
      startTime: trackStartTime,
      label: trackLabel,
    });
    setTimeline(updated);
    setAddingTrack(null);
    setTrackAssetId("");
    setTrackLabel("");
    setTrackStartTime(0);
  }

  async function handleRemoveAudioTrack(trackId: string) {
    if (!projectId || !sceneId) return;
    const updated = await api.removeAudioTrack(projectId, sceneId, trackId);
    setTimeline(updated);
  }

  async function handleExport() {
    if (!projectId || !sceneId) return;
    setExporting(true);
    try {
      const job = await api.exportScene(projectId, sceneId);
      setExportJob(job);
      pollExport(job.id);
    } catch (err) {
      setExportJob({
        id: "error",
        projectId: projectId!,
        sceneId: sceneId!,
        timelineId: timeline?.id || "",
        status: "failed",
        progress: 0,
        error: err instanceof Error ? err.message : "Failed to start export",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setExporting(false);
    }
  }

  function pollExport(jobId: string) {
    const interval = setInterval(async () => {
      try {
        const job = await api.pollExport(jobId);
        setExportJob(job);
        if (job.status === "completed" || job.status === "failed") {
          clearInterval(interval);
          setExporting(false);
        }
      } catch {
        clearInterval(interval);
        setExporting(false);
      }
    }, 2000);
  }

  if (!project || !scene) {
    return (
      <div className="p-4 sm:p-8">
        <p className="text-virtue-text-muted text-sm">Loading scene editor...</p>
      </div>
    );
  }

  const readyShots = timeline ? timeline.shots.filter((s) => s.renderAssetId).length : 0;
  const totalShots = timeline?.shots.length || 0;
  const allReady = totalShots > 0 && readyShots === totalShots;
  const totalAudioTracks =
    (timeline?.musicTracks.length || 0) +
    (timeline?.voiceoverTracks.length || 0) +
    (timeline?.sfxTracks.length || 0);

  const mobileTabs: { key: MobileTab; label: string }[] = [
    { key: "shots", label: "Shots" },
    { key: "transitions", label: "Transitions" },
    { key: "audio", label: "Audio" },
    { key: "pacing", label: "Pacing" },
    { key: "export", label: "Export" },
  ];

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
          <span className="rounded bg-virtue-accent/10 border border-virtue-accent/20 px-2 py-0.5 text-[9px] text-virtue-accent font-mono uppercase shrink-0 hidden sm:inline">
            Editor
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={refreshTimeline}
            className="text-[10px] text-virtue-text-muted hover:text-virtue-text-secondary uppercase tracking-wider transition-colors min-h-[44px] flex items-center"
          >
            Refresh
          </button>
          <span className="text-[10px] text-virtue-text-muted tabular-nums hidden sm:inline">
            {readyShots}/{totalShots} rendered
          </span>
        </div>
      </div>

      {/* Mobile tabs — horizontal scrollable */}
      <div className="flex border-b border-[rgba(255,255,255,0.06)] overflow-x-auto no-scrollbar lg:hidden bg-virtue-bg">
        {mobileTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMobileTab(tab.key)}
            className={`flex-shrink-0 px-4 py-3 text-[12px] uppercase tracking-wider font-medium transition-colors touch-manipulation ${
              mobileTab === tab.key
                ? "text-virtue-accent border-b-2 border-virtue-accent"
                : "text-virtue-text-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main editor area — shown on desktop always, on mobile only for "shots" tab */}
        <div className={`flex-1 flex flex-col overflow-hidden ${mobileTab !== "shots" ? "hidden lg:flex" : ""}`}>
          {/* Video track header */}
          <div className="sticky top-0 z-10 border-b border-[rgba(255,255,255,0.04)] bg-virtue-bg px-4 sm:px-6 py-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-virtue-accent/80 font-mono uppercase tracking-widest">
                Video Track
              </span>
              <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
              {timeline?.pacingPreset && (
                <span className="rounded bg-virtue-accent/10 px-2 py-0.5 text-[8px] text-virtue-accent font-mono uppercase">
                  {timeline.pacingPreset}
                </span>
              )}
            </div>
          </div>

          {/* Shot timeline */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 sm:px-6 py-4 space-y-0">
              {(!timeline || timeline.shots.length === 0) && (
                <div className="text-center py-16">
                  <p className="text-sm text-virtue-text-muted">No shots in this scene yet.</p>
                  <Link
                    href={`/projects/${projectId}`}
                    className="text-xs text-virtue-text-muted hover:text-virtue-text-secondary mt-2 inline-block transition-colors"
                  >
                    Add shots in the project view
                  </Link>
                </div>
              )}

              {timeline?.shots.map((tShot, index) => {
                const shot = getShotDetails(tShot.shotId);
                const hasAsset = !!tShot.renderAssetId;
                const isDragging = dragIndex === index;
                const isDropTarget = dropIndex === index;

                return (
                  <div key={tShot.shotId}>
                    {index > 0 && (
                      <div className="flex items-center gap-2 py-1.5 px-4 sm:px-14">
                        <div className="flex-1 h-px bg-[rgba(255,255,255,0.04)]" />
                        <button
                          onClick={() => {
                            const current = tShot.transition.type;
                            const types: Array<"cut" | "fade" | "cross-dissolve"> = ["cut", "fade", "cross-dissolve"];
                            const nextIdx = (types.indexOf(current) + 1) % types.length;
                            handleSetTransition(tShot.shotId, types[nextIdx], 1.0);
                          }}
                          className={`
                            flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider
                            transition-all cursor-pointer border touch-manipulation min-h-[36px]
                            ${tShot.transition.type === "cut"
                              ? "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-virtue-text-muted hover:border-[rgba(255,255,255,0.12)]"
                              : tShot.transition.type === "fade"
                                ? "bg-purple-950/40 border-purple-800/40 text-purple-400 hover:border-purple-600/60"
                                : "bg-blue-950/40 border-blue-800/40 text-blue-400 hover:border-blue-600/60"
                            }
                          `}
                        >
                          <span>{tShot.transition.type === "cut" ? "—" : tShot.transition.type === "fade" ? "◐" : "◑"}</span>
                          {tShot.transition.type}
                          {tShot.transition.durationSec > 0 && (
                            <span className="opacity-60">{tShot.transition.durationSec}s</span>
                          )}
                        </button>
                        <div className="flex-1 h-px bg-[rgba(255,255,255,0.04)]" />
                      </div>
                    )}

                    {/* Shot row — stacked on mobile, horizontal on desktop */}
                    <div
                      draggable
                      onDragStart={() => setDragIndex(index)}
                      onDragOver={(e) => { e.preventDefault(); setDropIndex(index); }}
                      onDrop={() => handleDrop(index)}
                      onDragEnd={() => { setDragIndex(null); setDropIndex(null); }}
                      className={`
                        group rounded border transition-all cursor-grab active:cursor-grabbing touch-manipulation
                        ${isDragging ? "opacity-40 scale-[0.98]" : ""}
                        ${isDropTarget && !isDragging ? "border-virtue-accent/60" : "border-[rgba(255,255,255,0.06)]"}
                        ${hasAsset ? "bg-virtue-surface" : "bg-virtue-bg"}
                        hover:border-[rgba(255,255,255,0.1)]
                        flex flex-col sm:flex-row sm:items-stretch
                      `}
                    >
                      {/* Index + timecode */}
                      <div className="flex sm:flex-col items-center justify-between sm:justify-center w-full sm:w-14 shrink-0 border-b sm:border-b-0 sm:border-r border-[rgba(255,255,255,0.04)] px-4 sm:px-0 py-2 sm:py-3">
                        <div className="flex sm:flex-col items-center gap-2 sm:gap-0">
                          <span className="text-[10px] text-virtue-text-muted font-mono tabular-nums">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="text-[9px] text-virtue-text-muted font-mono sm:mt-1 tabular-nums">
                            {tShot.duration.toFixed(1)}s
                          </span>
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
                          <span className="text-xs text-virtue-text-secondary truncate">
                            {shot?.description || tShot.shotId}
                          </span>
                        </div>

                        {/* Timeline bar — hidden on small mobile */}
                        <div className="hidden sm:block relative h-6 rounded bg-[rgba(255,255,255,0.02)] overflow-hidden">
                          <div
                            className={`absolute inset-y-0 left-0 rounded ${
                              hasAsset
                                ? "bg-emerald-900/40 border border-emerald-800/40"
                                : "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]"
                            }`}
                            style={{
                              width: `${Math.min(100, (tShot.duration / (timeline?.totalDuration || 1)) * 100 * 2.5)}%`,
                            }}
                          >
                            <div className="flex items-center h-full px-2 gap-2">
                              {shot && (
                                <span className="text-[8px] text-virtue-text-muted font-mono truncate">
                                  {shot.cameraMove} · {shot.lens}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-virtue-text-muted font-mono tabular-nums">
                            {formatTimecode(tShot.startTime)} — {formatTimecode(tShot.startTime + tShot.duration)}
                          </span>
                        </div>

                        {/* Mobile shot meta */}
                        <div className="sm:hidden flex items-center gap-2 mt-1">
                          {shot && (
                            <span className="text-[11px] text-virtue-text-muted font-mono">
                              {shot.cameraMove} · {shot.lens}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status — hidden on mobile (shown in header instead) */}
                      <div className="hidden sm:flex items-center justify-center w-20 shrink-0 border-l border-[rgba(255,255,255,0.04)] px-2">
                        {hasAsset ? (
                          <span className="text-[9px] text-emerald-500 font-mono uppercase">Ready</span>
                        ) : (
                          <span className="text-[9px] text-virtue-text-muted font-mono uppercase">Pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Audio track lanes */}
            {timeline && totalAudioTracks > 0 && (
              <div className="px-4 sm:px-6 pb-4">
                {timeline.musicTracks.length > 0 && (
                  <AudioLane label="Music" color="purple" tracks={timeline.musicTracks} totalDuration={timeline.totalDuration} onRemove={handleRemoveAudioTrack} />
                )}
                {timeline.voiceoverTracks.length > 0 && (
                  <AudioLane label="Voiceover" color="sky" tracks={timeline.voiceoverTracks} totalDuration={timeline.totalDuration} onRemove={handleRemoveAudioTrack} />
                )}
                {timeline.sfxTracks.length > 0 && (
                  <AudioLane label="SFX" color="orange" tracks={timeline.sfxTracks} totalDuration={timeline.totalDuration} onRemove={handleRemoveAudioTrack} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right panel — desktop only */}
        <div className="hidden lg:block w-80 border-l border-[rgba(255,255,255,0.06)] bg-virtue-bg overflow-y-auto shrink-0">
          <div className="flex border-b border-[rgba(255,255,255,0.06)]">
            {(["transitions", "audio", "pacing"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActivePanel(tab)}
                className={`flex-1 py-2.5 text-[10px] uppercase tracking-wider font-medium transition-colors ${
                  activePanel === tab
                    ? "text-virtue-accent border-b-2 border-virtue-accent"
                    : "text-virtue-text-muted hover:text-virtue-text-secondary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-5">
            {activePanel === "transitions" && <TransitionsPanel timeline={timeline} onSetTransition={handleSetTransition} />}
            {activePanel === "audio" && (
              <AudioPanel
                timeline={timeline}
                addingTrack={addingTrack}
                setAddingTrack={setAddingTrack}
                trackLabel={trackLabel}
                setTrackLabel={setTrackLabel}
                trackAssetId={trackAssetId}
                setTrackAssetId={setTrackAssetId}
                trackStartTime={trackStartTime}
                setTrackStartTime={setTrackStartTime}
                onAddTrack={handleAddAudioTrack}
                onRemoveTrack={handleRemoveAudioTrack}
              />
            )}
            {activePanel === "pacing" && (
              <PacingPanel timeline={timeline} totalShots={totalShots} totalAudioTracks={totalAudioTracks} allReady={allReady} onPreset={handlePacingPreset} />
            )}

            <div className="h-px bg-[rgba(255,255,255,0.06)]" />
            <ExportSection allReady={allReady} exporting={exporting} totalShots={totalShots} readyShots={readyShots} exportJob={exportJob} onExport={handleExport} />
          </div>
        </div>

        {/* Mobile panel content */}
        <div className={`flex-1 overflow-y-auto lg:hidden ${mobileTab === "shots" ? "hidden" : ""}`}>
          <div className="p-4 space-y-5">
            {mobileTab === "transitions" && <TransitionsPanel timeline={timeline} onSetTransition={handleSetTransition} />}
            {mobileTab === "audio" && (
              <AudioPanel
                timeline={timeline}
                addingTrack={addingTrack}
                setAddingTrack={setAddingTrack}
                trackLabel={trackLabel}
                setTrackLabel={setTrackLabel}
                trackAssetId={trackAssetId}
                setTrackAssetId={setTrackAssetId}
                trackStartTime={trackStartTime}
                setTrackStartTime={setTrackStartTime}
                onAddTrack={handleAddAudioTrack}
                onRemoveTrack={handleRemoveAudioTrack}
              />
            )}
            {mobileTab === "pacing" && (
              <PacingPanel timeline={timeline} totalShots={totalShots} totalAudioTracks={totalAudioTracks} allReady={allReady} onPreset={handlePacingPreset} />
            )}
            {mobileTab === "export" && (
              <ExportSection allReady={allReady} exporting={exporting} totalShots={totalShots} readyShots={readyShots} exportJob={exportJob} onExport={handleExport} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Extracted panel components for reuse between mobile and desktop */

function TransitionsPanel({ timeline, onSetTransition }: { timeline: VirtueEditorTimeline | null; onSetTransition: (shotId: string, type: "cut" | "fade" | "cross-dissolve", dur: number) => void }) {
  return (
    <>
      <div>
        <label className="section-label">Default Transition</label>
        <div className="space-y-1.5">
          {TRANSITION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                if (!timeline) return;
                timeline.shots.forEach((s, i) => {
                  if (i > 0) onSetTransition(s.shotId, opt.value, opt.value === "cut" ? 0 : 1.0);
                });
              }}
              className="w-full flex items-center gap-3 rounded-md px-3 py-3 sm:py-2 text-[13px] sm:text-xs text-virtue-text-secondary border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.12)] hover:text-virtue-text transition-all touch-manipulation"
            >
              <span className="text-base">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="section-label">Transition Duration</label>
        <p className="text-[12px] sm:text-[10px] text-virtue-text-muted mb-2">Click transition badges between shots to cycle types</p>
      </div>
    </>
  );
}

function AudioPanel({
  timeline, addingTrack, setAddingTrack, trackLabel, setTrackLabel,
  trackAssetId, setTrackAssetId, trackStartTime, setTrackStartTime,
  onAddTrack, onRemoveTrack,
}: {
  timeline: VirtueEditorTimeline | null;
  addingTrack: "music" | "voiceover" | "sfx" | null;
  setAddingTrack: (v: "music" | "voiceover" | "sfx" | null) => void;
  trackLabel: string; setTrackLabel: (v: string) => void;
  trackAssetId: string; setTrackAssetId: (v: string) => void;
  trackStartTime: number; setTrackStartTime: (v: number) => void;
  onAddTrack: () => void;
  onRemoveTrack: (id: string) => void;
}) {
  return (
    <>
      <div>
        <label className="section-label">Audio Tracks</label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {(["music", "voiceover", "sfx"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setAddingTrack(type)}
              className={`rounded-md py-3 sm:py-2 text-[10px] uppercase tracking-wider font-medium border transition-all touch-manipulation ${
                addingTrack === type
                  ? "bg-virtue-accent/10 border-virtue-accent/30 text-virtue-accent"
                  : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-virtue-text-muted hover:border-[rgba(255,255,255,0.12)] hover:text-virtue-text-secondary"
              }`}
            >
              + {type}
            </button>
          ))}
        </div>

        {addingTrack && (
          <div className="space-y-2 p-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.015)]">
            <p className="text-[9px] text-virtue-accent uppercase tracking-wider font-semibold">Add {addingTrack} track</p>
            <input
              value={trackLabel}
              onChange={(e) => setTrackLabel(e.target.value)}
              placeholder="Label (optional)"
              className="glass-input w-full"
            />
            <input
              value={trackAssetId}
              onChange={(e) => setTrackAssetId(e.target.value)}
              placeholder="Asset ID"
              className="glass-input w-full"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={trackStartTime}
                onChange={(e) => setTrackStartTime(Number(e.target.value))}
                placeholder="Start (s)"
                min={0}
                step={0.5}
                className="glass-input flex-1"
              />
              <button
                onClick={onAddTrack}
                disabled={!trackAssetId}
                className="rounded-md bg-virtue-accent px-4 py-2.5 sm:py-1.5 text-[12px] sm:text-[10px] font-semibold text-white uppercase disabled:opacity-30 hover:bg-virtue-accent/90 transition-colors touch-manipulation"
              >
                Add
              </button>
            </div>
            <button onClick={() => setAddingTrack(null)} className="text-[12px] sm:text-[10px] text-virtue-text-muted hover:text-virtue-text-secondary transition-colors touch-manipulation min-h-[44px] flex items-center">
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <TrackSummary label="Music" tracks={timeline?.musicTracks || []} onRemove={onRemoveTrack} />
        <TrackSummary label="Voiceover" tracks={timeline?.voiceoverTracks || []} onRemove={onRemoveTrack} />
        <TrackSummary label="SFX" tracks={timeline?.sfxTracks || []} onRemove={onRemoveTrack} />
      </div>
    </>
  );
}

function PacingPanel({
  timeline, totalShots, totalAudioTracks, allReady, onPreset,
}: {
  timeline: VirtueEditorTimeline | null;
  totalShots: number;
  totalAudioTracks: number;
  allReady: boolean;
  onPreset: (preset: string) => void;
}) {
  return (
    <>
      <div>
        <label className="section-label">Quick Presets</label>
        <div className="space-y-1.5">
          {PACING_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onPreset(preset.value)}
              className={`w-full flex flex-col items-start rounded-md px-3 py-3 sm:py-2.5 border transition-all touch-manipulation ${
                timeline?.pacingPreset === preset.value
                  ? "bg-virtue-accent/10 border-virtue-accent/30"
                  : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"
              }`}
            >
              <span className={`text-[13px] sm:text-xs font-medium ${timeline?.pacingPreset === preset.value ? "text-virtue-accent" : "text-virtue-text-secondary"}`}>
                {preset.label}
              </span>
              <span className="text-[12px] sm:text-[10px] text-virtue-text-muted mt-0.5">{preset.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="section-label">Scene Stats</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="glass-panel p-3 sm:p-2.5">
            <p className="text-[9px] text-virtue-text-muted uppercase">Shots</p>
            <p className="text-base font-bold text-virtue-text tabular-nums">{totalShots}</p>
          </div>
          <div className="glass-panel p-3 sm:p-2.5">
            <p className="text-[9px] text-virtue-text-muted uppercase">Duration</p>
            <p className="text-base font-bold text-virtue-text tabular-nums">{(timeline?.totalDuration || 0).toFixed(1)}s</p>
          </div>
          <div className="glass-panel p-3 sm:p-2.5">
            <p className="text-[9px] text-virtue-text-muted uppercase">Audio</p>
            <p className="text-base font-bold text-virtue-text tabular-nums">{totalAudioTracks}</p>
          </div>
          <div className="glass-panel p-3 sm:p-2.5">
            <p className="text-[9px] text-virtue-text-muted uppercase">Ready</p>
            <p className={`text-base font-bold tabular-nums ${allReady ? "text-emerald-400" : "text-virtue-text-muted"}`}>{allReady ? "Yes" : "No"}</p>
          </div>
        </div>
      </div>
    </>
  );
}

function ExportSection({
  allReady, exporting, totalShots, readyShots, exportJob, onExport,
}: {
  allReady: boolean;
  exporting: boolean;
  totalShots: number;
  readyShots: number;
  exportJob: VirtueExportJob | null;
  onExport: () => void;
}) {
  return (
    <>
      <div>
        <label className="section-label">Final Export</label>
        <button
          onClick={onExport}
          disabled={!allReady || exporting}
          className="w-full rounded-md bg-gradient-to-r from-virtue-accent to-blue-500 py-3 sm:py-2.5 text-[15px] sm:text-sm font-semibold text-white transition-all hover:from-virtue-accent/90 hover:to-blue-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:from-[rgba(255,255,255,0.08)] disabled:to-[rgba(255,255,255,0.08)] touch-manipulation active:scale-[0.98]"
        >
          {exporting ? "Exporting..." : allReady ? "Export Scene" : "Render all shots first"}
        </button>
        {!allReady && totalShots > 0 && (
          <p className="text-[12px] sm:text-[10px] text-virtue-text-muted text-center mt-1.5">
            {totalShots - readyShots} shot{totalShots - readyShots !== 1 ? "s" : ""} still need rendering
          </p>
        )}
      </div>

      {exportJob && (
        <div>
          <label className="section-label">Export Status</label>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`h-2 w-2 rounded-full shrink-0 ${
              exportJob.status === "completed" ? "bg-emerald-500" : exportJob.status === "failed" ? "bg-red-400" : "bg-virtue-accent animate-pulse"
            }`} />
            <span className={`text-[13px] sm:text-xs font-medium uppercase ${
              exportJob.status === "completed" ? "text-emerald-400" : exportJob.status === "failed" ? "text-red-400" : "text-virtue-accent"
            }`}>
              {exportJob.status.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-virtue-text-muted ml-auto tabular-nums">{exportJob.progress}%</span>
          </div>
          <div className="h-2 sm:h-1.5 rounded-full bg-[rgba(255,255,255,0.04)]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                exportJob.status === "completed" ? "bg-emerald-500" : exportJob.status === "failed" ? "bg-red-500" : "bg-virtue-accent"
              }`}
              style={{ width: `${exportJob.progress}%` }}
            />
          </div>
          {exportJob.error && <p className="text-[13px] sm:text-xs text-red-400 mt-1.5">{exportJob.error}</p>}
        </div>
      )}

      {exportJob?.output && exportJob.status === "completed" && (
        <div>
          <label className="section-label">Export Output</label>
          <div className="rounded-lg overflow-hidden border border-[rgba(255,255,255,0.06)] bg-black">
            <video src={exportJob.output.url} controls autoPlay loop muted playsInline className="w-full aspect-video" />
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-[11px] text-virtue-text-muted font-mono truncate">{exportJob.output.filename}</p>
            <p className="text-[10px] text-virtue-text-muted font-mono truncate">{exportJob.output.url}</p>
          </div>
        </div>
      )}
    </>
  );
}

function AudioLane({
  label, color, tracks, totalDuration, onRemove,
}: {
  label: string;
  color: "purple" | "sky" | "orange";
  tracks: VirtueAudioTrack[];
  totalDuration: number;
  onRemove: (id: string) => void;
}) {
  const colors = {
    purple: { bg: "bg-purple-950/30", border: "border-purple-800/40", text: "text-purple-400", fill: "bg-purple-900/50" },
    sky: { bg: "bg-sky-950/30", border: "border-sky-800/40", text: "text-sky-400", fill: "bg-sky-900/50" },
    orange: { bg: "bg-orange-950/30", border: "border-orange-800/40", text: "text-orange-400", fill: "bg-orange-900/50" },
  }[color];

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[9px] font-mono uppercase tracking-widest ${colors.text}`}>{label}</span>
        <div className="flex-1 h-px bg-[rgba(255,255,255,0.04)]" />
      </div>
      <div className={`relative h-8 rounded ${colors.bg} border ${colors.border} overflow-hidden`}>
        {tracks.map((track) => {
          const left = totalDuration > 0 ? (track.startTime / totalDuration) * 100 : 0;
          const end = track.endTime || totalDuration;
          const width = totalDuration > 0 ? ((end - track.startTime) / totalDuration) * 100 : 100;
          return (
            <div
              key={track.id}
              className={`absolute inset-y-0 rounded ${colors.fill} flex items-center px-2 group cursor-pointer`}
              style={{ left: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}
              title={`${track.label || track.type} · Vol: ${Math.round(track.volume * 100)}%`}
            >
              <span className={`text-[8px] font-mono truncate ${colors.text}`}>{track.label || track.assetId.slice(0, 8)}</span>
              <button
                onClick={() => onRemove(track.id)}
                className="ml-auto text-[8px] text-virtue-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                x
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrackSummary({ label, tracks, onRemove }: { label: string; tracks: VirtueAudioTrack[]; onRemove: (id: string) => void }) {
  if (tracks.length === 0) return null;
  return (
    <div>
      <p className="text-[9px] text-virtue-text-muted uppercase tracking-wider mb-1">{label} ({tracks.length})</p>
      {tracks.map((t) => (
        <div key={t.id} className="flex items-center gap-2 py-2 sm:py-1 px-2 rounded bg-[rgba(255,255,255,0.02)] mb-1">
          <span className="text-[11px] sm:text-[10px] text-virtue-text-secondary truncate flex-1">{t.label || t.assetId.slice(0, 12)}</span>
          <span className="text-[9px] text-virtue-text-muted tabular-nums">{Math.round(t.volume * 100)}%</span>
          <button onClick={() => onRemove(t.id)} className="text-[11px] sm:text-[9px] text-virtue-text-muted hover:text-red-400 transition-colors min-h-[44px] sm:min-h-0 flex items-center">
            x
          </button>
        </div>
      ))}
    </div>
  );
}

function formatTimecode(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
}
