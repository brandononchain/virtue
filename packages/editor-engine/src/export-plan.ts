import type { VirtueEditorTimeline, VirtueExportPlan } from "@virtue/types";

/**
 * Build an export plan from the editor timeline.
 * The export plan describes exactly what ffmpeg needs to do:
 * - video segments with transitions
 * - audio tracks to mix
 * - total duration and output format
 */
export function buildEditorExportPlan(
  timeline: VirtueEditorTimeline,
  assetPathResolver: (assetId: string) => string,
): VirtueExportPlan {
  const videoSegments = timeline.shots
    .filter((s) => s.renderAssetId)
    .map((s) => ({
      shotId: s.shotId,
      assetPath: assetPathResolver(s.renderAssetId!),
      startTime: s.startTime,
      duration: s.duration,
      transition: s.transition,
    }));

  const allAudioTracks = [
    ...timeline.musicTracks,
    ...timeline.voiceoverTracks,
    ...timeline.sfxTracks,
  ];

  const audioMix = allAudioTracks.map((t) => ({
    trackId: t.id,
    type: t.type,
    assetPath: assetPathResolver(t.assetId),
    startTime: t.startTime,
    endTime: t.endTime,
    volume: t.volume,
    fadeInSec: t.fadeInSec,
    fadeOutSec: t.fadeOutSec,
  }));

  return {
    timelineId: timeline.id,
    sceneId: timeline.sceneId,
    videoSegments,
    audioMix,
    totalDuration: timeline.totalDuration,
    outputFormat: "mp4",
  };
}
