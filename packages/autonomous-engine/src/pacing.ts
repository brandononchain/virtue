import type { VirtueScene } from "@virtue/types";

export interface PacingAdjustment {
  shotId: string;
  currentDuration: number;
  suggestedDuration: number;
  reason: string;
}

export interface PacingAnalysis {
  sceneId: string;
  currentAvgDuration: number;
  targetAvgDuration: number;
  overallPacingScore: number;
  adjustments: PacingAdjustment[];
  reorderSuggestion: string | null;
}

/**
 * Analyze and optimize pacing for a scene.
 */
export function optimizeScenePacing(scene: VirtueScene): PacingAnalysis {
  const shots = scene.shots;
  if (shots.length === 0) {
    return {
      sceneId: scene.id,
      currentAvgDuration: 0,
      targetAvgDuration: 4,
      overallPacingScore: 0,
      adjustments: [],
      reorderSuggestion: null,
    };
  }

  const durations = shots.map((s) => s.durationSec);
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  const targetAvg = 4; // Cinematic sweet spot

  const adjustments: PacingAdjustment[] = [];

  for (const shot of shots) {
    // Trim shots that are too long
    if (shot.durationSec > 8) {
      adjustments.push({
        shotId: shot.id,
        currentDuration: shot.durationSec,
        suggestedDuration: Math.max(4, shot.durationSec * 0.6),
        reason: `Shot is ${shot.durationSec}s — trimming to improve pace`,
      });
    }
    // Extend very short shots (< 2s) that aren't inserts
    else if (shot.durationSec < 2 && shot.shotType !== "pov") {
      adjustments.push({
        shotId: shot.id,
        currentDuration: shot.durationSec,
        suggestedDuration: 3,
        reason: "Shot is too brief for viewers to absorb — extend slightly",
      });
    }
  }

  // Check for monotonous pacing (all shots same length)
  const variance = durations.reduce((sum, d) => sum + (d - avg) ** 2, 0) / durations.length;
  const stdDev = Math.sqrt(variance);

  let reorderSuggestion: string | null = null;
  if (stdDev < 0.5 && shots.length >= 3) {
    reorderSuggestion = "Shot durations are very uniform — vary the rhythm by alternating longer establishing shots with shorter close-ups.";
  }

  // Check if pacing builds (short → long or long → short patterns)
  if (shots.length >= 4) {
    const firstHalfAvg = durations.slice(0, Math.floor(durations.length / 2))
      .reduce((a, b) => a + b, 0) / Math.floor(durations.length / 2);
    const secondHalfAvg = durations.slice(Math.floor(durations.length / 2))
      .reduce((a, b) => a + b, 0) / (durations.length - Math.floor(durations.length / 2));

    if (Math.abs(firstHalfAvg - secondHalfAvg) < 0.5) {
      reorderSuggestion = reorderSuggestion ||
        "Consider building pace: start with longer establishing shots, then accelerate with shorter cuts toward the climax.";
    }
  }

  // Overall pacing score
  const avgPenalty = avg < 2 ? 0.5 : avg > 8 ? 0.4 : avg > 6 ? 0.6 : 1.0;
  const variancePenalty = stdDev < 0.3 ? 0.6 : stdDev > 5 ? 0.5 : 1.0;
  const overallPacingScore = Math.round(avgPenalty * variancePenalty * 100) / 100;

  return {
    sceneId: scene.id,
    currentAvgDuration: Math.round(avg * 10) / 10,
    targetAvgDuration: targetAvg,
    overallPacingScore,
    adjustments,
    reorderSuggestion,
  };
}
