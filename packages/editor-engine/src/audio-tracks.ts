import type { VirtueEditorTimeline, VirtueAudioTrack } from "@virtue/types";
import { createId, nowISO } from "@virtue/validation";

/**
 * Add a music track to the editor timeline.
 */
export function addMusicTrack(
  timeline: VirtueEditorTimeline,
  assetId: string,
  startTime: number,
  endTime?: number,
  options?: { label?: string; volume?: number; fadeInSec?: number; fadeOutSec?: number },
): VirtueEditorTimeline {
  const track: VirtueAudioTrack = {
    id: createId(),
    type: "music",
    assetId,
    label: options?.label || "",
    startTime,
    endTime,
    volume: options?.volume ?? 0.7,
    fadeInSec: options?.fadeInSec ?? 1,
    fadeOutSec: options?.fadeOutSec ?? 2,
  };

  return {
    ...timeline,
    musicTracks: [...timeline.musicTracks, track],
    updatedAt: nowISO(),
  };
}

/**
 * Add a voiceover track to the editor timeline.
 */
export function addVoiceoverTrack(
  timeline: VirtueEditorTimeline,
  assetId: string,
  startTime: number,
  options?: { label?: string; volume?: number; fadeInSec?: number; fadeOutSec?: number },
): VirtueEditorTimeline {
  const track: VirtueAudioTrack = {
    id: createId(),
    type: "voiceover",
    assetId,
    label: options?.label || "",
    startTime,
    volume: options?.volume ?? 1,
    fadeInSec: options?.fadeInSec ?? 0.3,
    fadeOutSec: options?.fadeOutSec ?? 0.5,
  };

  return {
    ...timeline,
    voiceoverTracks: [...timeline.voiceoverTracks, track],
    updatedAt: nowISO(),
  };
}

/**
 * Add a sound effect track to the editor timeline.
 */
export function addSfxTrack(
  timeline: VirtueEditorTimeline,
  assetId: string,
  startTime: number,
  options?: { label?: string; volume?: number },
): VirtueEditorTimeline {
  const track: VirtueAudioTrack = {
    id: createId(),
    type: "sfx",
    assetId,
    label: options?.label || "",
    startTime,
    volume: options?.volume ?? 0.8,
    fadeInSec: 0,
    fadeOutSec: 0,
  };

  return {
    ...timeline,
    sfxTracks: [...timeline.sfxTracks, track],
    updatedAt: nowISO(),
  };
}

/**
 * Remove an audio track by ID from any track lane.
 */
export function removeAudioTrack(
  timeline: VirtueEditorTimeline,
  trackId: string,
): VirtueEditorTimeline {
  return {
    ...timeline,
    musicTracks: timeline.musicTracks.filter((t) => t.id !== trackId),
    voiceoverTracks: timeline.voiceoverTracks.filter((t) => t.id !== trackId),
    sfxTracks: timeline.sfxTracks.filter((t) => t.id !== trackId),
    updatedAt: nowISO(),
  };
}

/**
 * Update properties of an existing audio track.
 */
export function updateAudioTrack(
  timeline: VirtueEditorTimeline,
  trackId: string,
  updates: Partial<Pick<VirtueAudioTrack, "startTime" | "endTime" | "volume" | "fadeInSec" | "fadeOutSec" | "label">>,
): VirtueEditorTimeline {
  const updateFn = (t: VirtueAudioTrack) =>
    t.id === trackId ? { ...t, ...updates } : t;

  return {
    ...timeline,
    musicTracks: timeline.musicTracks.map(updateFn),
    voiceoverTracks: timeline.voiceoverTracks.map(updateFn),
    sfxTracks: timeline.sfxTracks.map(updateFn),
    updatedAt: nowISO(),
  };
}
