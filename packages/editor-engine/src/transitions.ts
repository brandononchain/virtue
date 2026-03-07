import type { VirtueEditorTimeline, VirtueTransition } from "@virtue/types";
import { nowISO } from "@virtue/validation";
import { recalculateTimings } from "./pacing.js";

/**
 * Set a transition between two adjacent shots.
 * The transition is stored on the second shot (the one being transitioned into).
 */
export function addTransition(
  timeline: VirtueEditorTimeline,
  shotIdB: string,
  transition: VirtueTransition,
): VirtueEditorTimeline {
  const shotIndex = timeline.shots.findIndex((s) => s.shotId === shotIdB);
  if (shotIndex <= 0) return timeline; // Can't add transition to first shot

  const updated = {
    ...timeline,
    shots: timeline.shots.map((s, i) =>
      i === shotIndex ? { ...s, transition } : s,
    ),
    updatedAt: nowISO(),
  };

  return recalculateTimings(updated);
}

/**
 * Remove transition from a shot (revert to cut).
 */
export function removeTransition(
  timeline: VirtueEditorTimeline,
  shotId: string,
): VirtueEditorTimeline {
  return addTransition(timeline, shotId, { type: "cut", durationSec: 0 });
}

/**
 * Set a default transition type between all shots.
 */
export function setDefaultTransitions(
  timeline: VirtueEditorTimeline,
  transition: VirtueTransition,
): VirtueEditorTimeline {
  const updated = {
    ...timeline,
    shots: timeline.shots.map((s, i) =>
      i === 0 ? s : { ...s, transition },
    ),
    updatedAt: nowISO(),
  };

  return recalculateTimings(updated);
}
