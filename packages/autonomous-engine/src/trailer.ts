import type { VirtueScene, VirtueHighlight, VirtueTrailerPlan } from "@virtue/types";
import { extractHighlights } from "./highlights.js";

const MAX_TRAILER_DURATION = 30; // seconds
const MIN_HIGHLIGHTS = 3;
const TRAILER_SHOT_DURATION = 2.5; // shorter for trailer pacing

/**
 * Generate a trailer plan from project scenes by selecting the strongest highlights.
 */
export function generateTrailer(
  projectId: string,
  scenes: VirtueScene[],
  title?: string,
): VirtueTrailerPlan {
  // Extract highlights from all scenes
  const allHighlights: VirtueHighlight[] = [];
  for (const scene of scenes) {
    const sceneHighlights = extractHighlights(scene);
    allHighlights.push(...sceneHighlights);
  }

  // Sort by score, take the best ones
  allHighlights.sort((a, b) => b.score - a.score);

  // Select highlights up to max duration
  const selected: VirtueHighlight[] = [];
  let totalDuration = 0;

  for (const hl of allHighlights) {
    const shotDuration = Math.min(hl.durationSec, TRAILER_SHOT_DURATION);
    if (totalDuration + shotDuration > MAX_TRAILER_DURATION) break;
    selected.push({ ...hl, durationSec: shotDuration });
    totalDuration += shotDuration;

    if (selected.length >= 12) break; // cap at 12 clips
  }

  // Reorder: start with visual/cinematic, build to action, end with emotional
  const ordered = reorderForTrailer(selected);

  return {
    id: `trailer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    projectId,
    title: title || "Auto-Generated Trailer",
    highlights: ordered,
    totalDuration: Math.round(ordered.reduce((sum, h) => sum + h.durationSec, 0) * 10) / 10,
    pacingPreset: "trailer",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Reorder highlights for cinematic trailer flow:
 * 1. Visual/establishing openers
 * 2. Character/intimate moments
 * 3. Action/spectacle climax
 * 4. Emotional closer
 */
function reorderForTrailer(highlights: VirtueHighlight[]): VirtueHighlight[] {
  const visual = highlights.filter((h) => h.tags.includes("cinematic") || h.tags.includes("visual"));
  const intimate = highlights.filter((h) => h.tags.includes("intimate") && !h.tags.includes("cinematic"));
  const action = highlights.filter((h) => h.tags.includes("action"));
  const emotional = highlights.filter((h) => h.tags.includes("emotional") && !h.tags.includes("action"));
  const rest = highlights.filter((h) =>
    !visual.includes(h) && !intimate.includes(h) &&
    !action.includes(h) && !emotional.includes(h),
  );

  // Build trailer arc
  const ordered: VirtueHighlight[] = [];
  const seen = new Set<string>();
  const add = (items: VirtueHighlight[]) => {
    for (const item of items) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        ordered.push(item);
      }
    }
  };

  add(visual.slice(0, 2));   // Open with visuals
  add(intimate.slice(0, 2)); // Character moments
  add(rest);                 // Fill
  add(action);               // Build to action
  add(emotional.slice(0, 1));// Emotional closer
  add(visual.slice(2));      // Remaining visuals
  add(intimate.slice(2));    // Remaining intimate

  return ordered;
}
