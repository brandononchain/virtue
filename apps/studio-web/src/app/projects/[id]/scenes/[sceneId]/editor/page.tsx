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

export default function SceneEditorPage() {
  const { id: projectId, sceneId } = useParams<{ id: string; sceneId: string }>();

  const [project, setProject] = useState<VirtueProject | null>(null);
  const [scene, setScene] = useState<VirtueScene | null>(null);
  const [timeline, setTimeline] = useState<VirtueEditorTimeline | null>(null);
  const [renderJobs, setRenderJobs] = useState<VirtueRenderJob[]>([]);
  const [exportJob, setExportJob] = useState<VirtueExportJob | null>(null);
  const [exporting, setExporting] = useState(false);
  const [activePanel, setActivePanel] = useState<"transitions" | "audio" | "pacing">("transitions");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // Audio track add form
  const [addingTrack, setAddingTrack] = useState<"music" | "voiceover" | "sfx" | null>(null);
  const [trackAssetId, setTrackAssetId] = useState("");
  const [trackLabel, setTrackLabel] = useState("");
  const [trackStartTime, setTrackStartTime] = useState(0);

  // Load data
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

  // Transition handling
  async function handleSetTransition(
    shotId: string,
    type: "cut" | "fade" | "cross-dissolve",
    durationSec: number,
  ) {
    if (!projectId || !sceneId) return;
    const updated = await api.addEditorTransition(projectId, sceneId, shotId, {
      type,
      durationSec: type === "cut" ? 0 : durationSec,
    });
    setTimeline(updated);
  }

  // Pacing preset
  async function handlePacingPreset(preset: string) {
    if (!projectId || !sceneId) return;
    const updated = await api.applyPacingPreset(projectId, sceneId, preset);
    setTimeline(updated);
  }

  // Drag reorder
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

  // Add audio track
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

  // Remove audio track
  async function handleRemoveAudioTrack(trackId: string) {
    if (!projectId || !sceneId) return;
    const updated = await api.removeAudioTrack(projectId, sceneId, trackId);
    setTimeline(updated);
  }

  // Export
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
      <div className="p-8">
        <p className="text-zinc-500 text-sm">Loading scene editor...</p>
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

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-6 py-3 bg-[#080808]">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}`}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            {project.name}
          </Link>
          <span className="text-zinc-700">/</span>
          <Link
            href={`/projects/${projectId}/scenes/${sceneId}/timeline`}
            className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            {scene.title}
          </Link>
          <span className="text-zinc-700">/</span>
          <h1 className="text-sm font-semibold text-zinc-200">Editor</h1>
          <span className="rounded bg-amber-900/40 border border-amber-800/40 px-2 py-0.5 text-[9px] text-amber-400 font-mono uppercase">
            Cinematic Editor
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshTimeline}
            className="text-[10px] text-zinc-500 hover:text-zinc-300 uppercase tracking-wider transition-colors"
          >
            Refresh
          </button>
          <span className="text-[10px] text-zinc-600 tabular-nums">
            {readyShots}/{totalShots} rendered
          </span>
          {timeline && (
            <span className="text-[10px] text-zinc-600 tabular-nums">
              {timeline.totalDuration.toFixed(1)}s
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main editor area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Video track header */}
          <div className="sticky top-0 z-10 border-b border-zinc-800/40 bg-[#0a0a0a] px-6 py-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-amber-500/80 font-mono uppercase tracking-widest">
                Video Track
              </span>
              <div className="flex-1 h-px bg-zinc-800/60" />
              {timeline?.pacingPreset && (
                <span className="rounded bg-amber-900/30 px-2 py-0.5 text-[8px] text-amber-500 font-mono uppercase">
                  {timeline.pacingPreset}
                </span>
              )}
            </div>
          </div>

          {/* Shot timeline with transitions */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-4 space-y-0">
              {(!timeline || timeline.shots.length === 0) && (
                <div className="text-center py-16">
                  <p className="text-sm text-zinc-600">No shots in this scene yet.</p>
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
                const hasAsset = !!tShot.renderAssetId;
                const isDragging = dragIndex === index;
                const isDropTarget = dropIndex === index;

                return (
                  <div key={tShot.shotId}>
                    {/* Transition badge between shots */}
                    {index > 0 && (
                      <div className="flex items-center gap-2 py-1.5 px-14">
                        <div className="flex-1 h-px bg-zinc-800/40" />
                        <button
                          onClick={() => {
                            const current = tShot.transition.type;
                            const types: Array<"cut" | "fade" | "cross-dissolve"> = ["cut", "fade", "cross-dissolve"];
                            const nextIdx = (types.indexOf(current) + 1) % types.length;
                            handleSetTransition(tShot.shotId, types[nextIdx], 1.0);
                          }}
                          className={`
                            flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-mono uppercase tracking-wider
                            transition-all cursor-pointer border
                            ${tShot.transition.type === "cut"
                              ? "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600"
                              : tShot.transition.type === "fade"
                                ? "bg-purple-950/40 border-purple-800/40 text-purple-400 hover:border-purple-600/60"
                                : "bg-blue-950/40 border-blue-800/40 text-blue-400 hover:border-blue-600/60"
                            }
                          `}
                        >
                          <span>
                            {tShot.transition.type === "cut" ? "—" : tShot.transition.type === "fade" ? "◐" : "◑"}
                          </span>
                          {tShot.transition.type}
                          {tShot.transition.durationSec > 0 && (
                            <span className="opacity-60">{tShot.transition.durationSec}s</span>
                          )}
                        </button>
                        <div className="flex-1 h-px bg-zinc-800/40" />
                      </div>
                    )}

                    {/* Shot row */}
                    <div
                      draggable
                      onDragStart={() => setDragIndex(index)}
                      onDragOver={(e) => { e.preventDefault(); setDropIndex(index); }}
                      onDrop={() => handleDrop(index)}
                      onDragEnd={() => { setDragIndex(null); setDropIndex(null); }}
                      className={`
                        group flex items-stretch rounded border transition-all cursor-grab active:cursor-grabbing
                        ${isDragging ? "opacity-40 scale-[0.98]" : ""}
                        ${isDropTarget && !isDragging ? "border-amber-600/60" : "border-zinc-800/60"}
                        ${hasAsset ? "bg-[#0c0c0c]" : "bg-[#0a0a0a]"}
                        hover:border-zinc-700/80
                      `}
                    >
                      {/* Index + timecode */}
                      <div className="flex flex-col items-center justify-center w-14 shrink-0 border-r border-zinc-800/40 py-3">
                        <span className="text-[10px] text-zinc-600 font-mono tabular-nums">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[9px] text-zinc-700 font-mono mt-1 tabular-nums">
                          {tShot.duration.toFixed(1)}s
                        </span>
                      </div>

                      {/* Shot info */}
                      <div className="flex-1 min-w-0 py-3 px-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${hasAsset ? "bg-emerald-500" : "bg-zinc-600"}`} />
                          {shot && (
                            <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[8px] text-zinc-500 font-mono uppercase shrink-0">
                              {shot.shotType}
                            </span>
                          )}
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
                              width: `${Math.min(100, (tShot.duration / (timeline?.totalDuration || 1)) * 100 * 2.5)}%`,
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
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-zinc-700 font-mono tabular-nums">
                            {formatTimecode(tShot.startTime)} — {formatTimecode(tShot.startTime + tShot.duration)}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-center w-20 shrink-0 border-l border-zinc-800/40 px-2">
                        {hasAsset ? (
                          <span className="text-[9px] text-emerald-500 font-mono uppercase">Ready</span>
                        ) : (
                          <span className="text-[9px] text-zinc-600 font-mono uppercase">Pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Audio track lanes */}
            {timeline && totalAudioTracks > 0 && (
              <div className="px-6 pb-4">
                {/* Music tracks */}
                {timeline.musicTracks.length > 0 && (
                  <AudioLane
                    label="Music"
                    color="purple"
                    tracks={timeline.musicTracks}
                    totalDuration={timeline.totalDuration}
                    onRemove={handleRemoveAudioTrack}
                  />
                )}
                {/* Voiceover tracks */}
                {timeline.voiceoverTracks.length > 0 && (
                  <AudioLane
                    label="Voiceover"
                    color="sky"
                    tracks={timeline.voiceoverTracks}
                    totalDuration={timeline.totalDuration}
                    onRemove={handleRemoveAudioTrack}
                  />
                )}
                {/* SFX tracks */}
                {timeline.sfxTracks.length > 0 && (
                  <AudioLane
                    label="SFX"
                    color="orange"
                    tracks={timeline.sfxTracks}
                    totalDuration={timeline.totalDuration}
                    onRemove={handleRemoveAudioTrack}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right panel — controls */}
        <div className="w-80 border-l border-zinc-800/60 bg-[#080808] overflow-y-auto shrink-0">
          {/* Panel tabs */}
          <div className="flex border-b border-zinc-800/60">
            {(["transitions", "audio", "pacing"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActivePanel(tab)}
                className={`flex-1 py-2.5 text-[10px] uppercase tracking-wider font-medium transition-colors ${
                  activePanel === tab
                    ? "text-amber-400 border-b-2 border-amber-500"
                    : "text-zinc-600 hover:text-zinc-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-5">
            {/* Transitions panel */}
            {activePanel === "transitions" && (
              <>
                <div>
                  <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-2">
                    Default Transition
                  </label>
                  <div className="space-y-1.5">
                    {TRANSITION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          if (!timeline || !projectId || !sceneId) return;
                          timeline.shots.forEach((s, i) => {
                            if (i > 0) {
                              handleSetTransition(s.shotId, opt.value, opt.value === "cut" ? 0 : 1.0);
                            }
                          });
                        }}
                        className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-xs text-zinc-400 border border-zinc-800/60 bg-zinc-900/40 hover:border-zinc-600 hover:text-zinc-200 transition-all"
                      >
                        <span className="text-base">{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                    Transition Duration
                  </label>
                  <p className="text-[10px] text-zinc-700 mb-2">
                    Click transition badges between shots to cycle types
                  </p>
                </div>
              </>
            )}

            {/* Audio panel */}
            {activePanel === "audio" && (
              <>
                <div>
                  <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-2">
                    Audio Tracks
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {(["music", "voiceover", "sfx"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setAddingTrack(type)}
                        className={`rounded-md py-2 text-[10px] uppercase tracking-wider font-medium border transition-all ${
                          addingTrack === type
                            ? "bg-amber-900/40 border-amber-700/60 text-amber-400"
                            : "bg-zinc-900/40 border-zinc-800/60 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                        }`}
                      >
                        + {type}
                      </button>
                    ))}
                  </div>

                  {addingTrack && (
                    <div className="space-y-2 p-3 rounded-lg border border-zinc-800/60 bg-zinc-900/30">
                      <p className="text-[9px] text-amber-500 uppercase tracking-wider font-semibold">
                        Add {addingTrack} track
                      </p>
                      <input
                        value={trackLabel}
                        onChange={(e) => setTrackLabel(e.target.value)}
                        placeholder="Label (optional)"
                        className="w-full rounded-md bg-zinc-800/60 border border-zinc-700/40 px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-amber-700/60"
                      />
                      <input
                        value={trackAssetId}
                        onChange={(e) => setTrackAssetId(e.target.value)}
                        placeholder="Asset ID"
                        className="w-full rounded-md bg-zinc-800/60 border border-zinc-700/40 px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-amber-700/60"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={trackStartTime}
                          onChange={(e) => setTrackStartTime(Number(e.target.value))}
                          placeholder="Start (s)"
                          min={0}
                          step={0.5}
                          className="flex-1 rounded-md bg-zinc-800/60 border border-zinc-700/40 px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-amber-700/60"
                        />
                        <button
                          onClick={handleAddAudioTrack}
                          disabled={!trackAssetId}
                          className="rounded-md bg-amber-600 px-4 py-1.5 text-[10px] font-semibold text-white uppercase disabled:opacity-30 hover:bg-amber-500 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      <button
                        onClick={() => setAddingTrack(null)}
                        className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Track summary */}
                <div className="space-y-2">
                  <TrackSummary label="Music" tracks={timeline?.musicTracks || []} onRemove={handleRemoveAudioTrack} />
                  <TrackSummary label="Voiceover" tracks={timeline?.voiceoverTracks || []} onRemove={handleRemoveAudioTrack} />
                  <TrackSummary label="SFX" tracks={timeline?.sfxTracks || []} onRemove={handleRemoveAudioTrack} />
                </div>
              </>
            )}

            {/* Pacing panel */}
            {activePanel === "pacing" && (
              <>
                <div>
                  <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-2">
                    Quick Presets
                  </label>
                  <div className="space-y-1.5">
                    {PACING_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => handlePacingPreset(preset.value)}
                        className={`w-full flex flex-col items-start rounded-md px-3 py-2.5 border transition-all ${
                          timeline?.pacingPreset === preset.value
                            ? "bg-amber-900/30 border-amber-700/60"
                            : "bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-600"
                        }`}
                      >
                        <span className={`text-xs font-medium ${
                          timeline?.pacingPreset === preset.value ? "text-amber-400" : "text-zinc-300"
                        }`}>
                          {preset.label}
                        </span>
                        <span className="text-[10px] text-zinc-600 mt-0.5">
                          {preset.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                    Scene Stats
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="studio-panel p-2.5">
                      <p className="text-[9px] text-zinc-600 uppercase">Shots</p>
                      <p className="text-base font-bold text-zinc-100 tabular-nums">{totalShots}</p>
                    </div>
                    <div className="studio-panel p-2.5">
                      <p className="text-[9px] text-zinc-600 uppercase">Duration</p>
                      <p className="text-base font-bold text-zinc-100 tabular-nums">
                        {(timeline?.totalDuration || 0).toFixed(1)}s
                      </p>
                    </div>
                    <div className="studio-panel p-2.5">
                      <p className="text-[9px] text-zinc-600 uppercase">Audio</p>
                      <p className="text-base font-bold text-zinc-100 tabular-nums">{totalAudioTracks}</p>
                    </div>
                    <div className="studio-panel p-2.5">
                      <p className="text-[9px] text-zinc-600 uppercase">Ready</p>
                      <p className={`text-base font-bold tabular-nums ${allReady ? "text-emerald-400" : "text-zinc-500"}`}>
                        {allReady ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Divider */}
            <div className="h-px bg-zinc-800/60" />

            {/* Export section */}
            <div>
              <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-2">
                Final Export
              </label>
              <button
                onClick={handleExport}
                disabled={!allReady || exporting}
                className="w-full rounded-md bg-gradient-to-r from-amber-600 to-orange-600 py-2.5 text-sm font-semibold text-white transition-all hover:from-amber-500 hover:to-orange-500 disabled:opacity-30 disabled:cursor-not-allowed disabled:from-zinc-700 disabled:to-zinc-700"
              >
                {exporting
                  ? "Exporting..."
                  : allReady
                    ? "Export Scene"
                    : "Render all shots first"}
              </button>

              {!allReady && totalShots > 0 && (
                <p className="text-[10px] text-zinc-600 text-center mt-1.5">
                  {totalShots - readyShots} shot{totalShots - readyShots !== 1 ? "s" : ""} still need rendering
                </p>
              )}
            </div>

            {/* Export progress */}
            {exportJob && (
              <div>
                <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                  Export Status
                </label>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      exportJob.status === "completed"
                        ? "bg-emerald-500"
                        : exportJob.status === "failed"
                          ? "bg-red-400"
                          : "bg-amber-400 animate-pulse"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium uppercase ${
                      exportJob.status === "completed"
                        ? "text-emerald-400"
                        : exportJob.status === "failed"
                          ? "text-red-400"
                          : "text-amber-400"
                    }`}
                  >
                    {exportJob.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-zinc-600 ml-auto tabular-nums">
                    {exportJob.progress}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-800">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      exportJob.status === "completed"
                        ? "bg-emerald-500"
                        : exportJob.status === "failed"
                          ? "bg-red-500"
                          : "bg-amber-500"
                    }`}
                    style={{ width: `${exportJob.progress}%` }}
                  />
                </div>
                {exportJob.error && (
                  <p className="text-xs text-red-400 mt-1.5">{exportJob.error}</p>
                )}
              </div>
            )}

            {/* Export output */}
            {exportJob?.output && exportJob.status === "completed" && (
              <div>
                <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                  Export Output
                </label>
                <div className="rounded-lg overflow-hidden border border-zinc-800/60 bg-black">
                  <video
                    src={exportJob.output.url}
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
                    {exportJob.output.filename}
                  </p>
                  <p className="text-[10px] text-zinc-600 font-mono truncate">
                    {exportJob.output.url}
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

/** Audio lane component for the timeline area */
function AudioLane({
  label,
  color,
  tracks,
  totalDuration,
  onRemove,
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
        <span className={`text-[9px] font-mono uppercase tracking-widest ${colors.text}`}>
          {label}
        </span>
        <div className="flex-1 h-px bg-zinc-800/40" />
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
              <span className={`text-[8px] font-mono truncate ${colors.text}`}>
                {track.label || track.assetId.slice(0, 8)}
              </span>
              <button
                onClick={() => onRemove(track.id)}
                className="ml-auto text-[8px] text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
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

/** Track summary in the sidebar */
function TrackSummary({
  label,
  tracks,
  onRemove,
}: {
  label: string;
  tracks: VirtueAudioTrack[];
  onRemove: (id: string) => void;
}) {
  if (tracks.length === 0) return null;
  return (
    <div>
      <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">{label} ({tracks.length})</p>
      {tracks.map((t) => (
        <div key={t.id} className="flex items-center gap-2 py-1 px-2 rounded bg-zinc-900/40 mb-1">
          <span className="text-[10px] text-zinc-400 truncate flex-1">
            {t.label || t.assetId.slice(0, 12)}
          </span>
          <span className="text-[9px] text-zinc-600 tabular-nums">
            {Math.round(t.volume * 100)}%
          </span>
          <button
            onClick={() => onRemove(t.id)}
            className="text-[9px] text-zinc-600 hover:text-red-400 transition-colors"
          >
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
