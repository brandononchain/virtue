import type { VirtueEditorTimeline, VirtueTransition } from "@virtue/types";
import { nowISO } from "@virtue/validation";

/** Pacing preset configurations */
const PACING_PRESETS: Record<string, {
  defaultTransition: VirtueTransition;
  durationMultiplier: number;
}> = {
  cinematic: {
    defaultTransition: { type: "cross-dissolve", durationSec: 1.5 },
    durationMultiplier: 1.0,
  },
  "slow-burn": {
    defaultTransition: { type: "fade", durationSec: 2.0 },
    durationMultiplier: 1.3,
  },
  "fast-cut": {
    defaultTransition: { type: "cut", durationSec: 0 },
    durationMultiplier: 0.7,
  },
  trailer: {
    defaultTransition: { type: "cut", durationSec: 0 },
    durationMultiplier: 0.5,
  },
};

/**
 * Apply a pacing preset to all shots in the timeline.
 * Adjusts transitions and shot durations proportionally.
 */
export function applyPacingPreset(
  timeline: VirtueEditorTimeline,
  preset: "cinematic" | "slow-burn" | "fast-cut" | "trailer",
): VirtueEditorTimeline {
  const config = PACING_PRESETS[preset];
  if (!config) return timeline;

  const updated = {
    ...timeline,
    pacingPreset: preset,
    shots: timeline.shots.map((s, i) => ({
      ...s,
      duration: Math.max(1, s.duration * config.durationMultiplier),
      transition: i === 0
        ? s.transition
        : config.defaultTransition,
    })),
    updatedAt: nowISO(),
  };

  return recalculateTimings(updated);
}

/**
 * Trim a shot's playback duration via trim points.
 */
export function trimShot(
  timeline: VirtueEditorTimeline,
  shotId: string,
  trimStart: number,
  trimEnd: number,
): VirtueEditorTimeline {
  const updated = {
    ...timeline,
    shots: timeline.shots.map((s) =>
      s.shotId === shotId
        ? {
            ...s,
            trimStart: Math.max(0, trimStart),
            trimEnd: Math.max(0, trimEnd),
            duration: Math.max(0.5, s.duration - trimStart - trimEnd),
          }
        : s,
    ),
    updatedAt: nowISO(),
  };

  return recalculateTimings(updated);
}

/**
 * Reorder shots in the editor timeline.
 */
export function reorderEditorShots(
  timeline: VirtueEditorTimeline,
  newOrder: string[],
): VirtueEditorTimeline {
  const shotMap = new Map(timeline.shots.map((s) => [s.shotId, s]));
  const reordered = newOrder
    .map((id) => shotMap.get(id))
    .filter((s): s is NonNullable<typeof s> => !!s);

  const updated = {
    ...timeline,
    shots: reordered,
    updatedAt: nowISO(),
  };

  return recalculateTimings(updated);
}

/**
 * Recalculate start times and total duration after modifications.
 * Accounts for transition overlap durations.
 */
export function recalculateTimings(
  timeline: VirtueEditorTimeline,
): VirtueEditorTimeline {
  let currentTime = 0;
  const shots = timeline.shots.map((s, i) => {
    const overlap = i > 0 ? s.transition.durationSec : 0;
    const startTime = Math.max(0, currentTime - overlap);
    const effectiveDuration = s.duration;
    currentTime = startTime + effectiveDuration;
    return { ...s, startTime };
  });

  return {
    ...timeline,
    shots,
    totalDuration: currentTime,
  };
}
