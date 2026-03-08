import type { VirtueScene, VirtueSceneAnalysis } from "@virtue/types";

/**
 * Analyze a scene's composition and return insights with suggestions.
 */
export function analyzeScene(scene: VirtueScene): VirtueSceneAnalysis {
  const shots = scene.shots;
  const shotCount = shots.length;
  const totalDuration = shots.reduce((sum, s) => sum + s.durationSec, 0);
  const avgShotDuration = shotCount > 0 ? totalDuration / shotCount : 0;

  // Shot type distribution
  const shotTypeDistribution: Record<string, number> = {};
  for (const shot of shots) {
    shotTypeDistribution[shot.shotType] = (shotTypeDistribution[shot.shotType] || 0) + 1;
  }

  // Camera variety: ratio of unique camera moves to total shots
  const uniqueCameraMoves = new Set(shots.map((s) => s.cameraMove));
  const cameraVariety = shotCount > 0 ? Math.min(uniqueCameraMoves.size / Math.max(shotCount, 1), 1) : 0;

  // Visual diversity: ratio of unique shot types to total shots
  const uniqueShotTypes = Object.keys(shotTypeDistribution).length;
  const visualDiversity = shotCount > 0 ? Math.min(uniqueShotTypes / Math.min(shotCount, 6), 1) : 0;

  // Pacing score: ideal avg is ~4s. Penalize if too uniform or too extreme
  const pacingScore = computePacingScore(shots.map((s) => s.durationSec));

  // Continuity coverage: do characters appear consistently
  const totalCharRefs = shots.reduce((n, s) => n + s.characterIds.length, 0);
  const continuityCoverage = shotCount > 0 ? Math.min(totalCharRefs / (shotCount * 0.5 + 1), 1) : 0;

  // Generate suggestions
  const suggestions = generateSuggestions(scene, {
    shotCount,
    totalDuration,
    avgShotDuration,
    shotTypeDistribution,
    cameraVariety,
    visualDiversity,
    pacingScore,
  });

  return {
    sceneId: scene.id,
    totalDuration,
    shotCount,
    avgShotDuration: Math.round(avgShotDuration * 10) / 10,
    shotTypeDistribution,
    cameraVariety: Math.round(cameraVariety * 100) / 100,
    pacingScore: Math.round(pacingScore * 100) / 100,
    visualDiversity: Math.round(visualDiversity * 100) / 100,
    continuityCoverage: Math.round(continuityCoverage * 100) / 100,
    suggestions,
    analyzedAt: new Date().toISOString(),
  };
}

function computePacingScore(durations: number[]): number {
  if (durations.length === 0) return 0;
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  // Ideal average: 3-5 seconds
  const avgPenalty = avg < 2 ? 0.6 : avg > 8 ? 0.5 : avg > 6 ? 0.7 : 1.0;
  // Variance penalty: too uniform is boring
  const variance = durations.reduce((sum, d) => sum + (d - avg) ** 2, 0) / durations.length;
  const stdDev = Math.sqrt(variance);
  const variancePenalty = stdDev < 0.5 ? 0.7 : stdDev > 4 ? 0.6 : 1.0;
  return Math.min(avgPenalty * variancePenalty, 1);
}

interface AnalysisMetrics {
  shotCount: number;
  totalDuration: number;
  avgShotDuration: number;
  shotTypeDistribution: Record<string, number>;
  cameraVariety: number;
  visualDiversity: number;
  pacingScore: number;
}

function generateSuggestions(
  scene: VirtueScene,
  metrics: AnalysisMetrics,
): VirtueSceneAnalysis["suggestions"] {
  const suggestions: VirtueSceneAnalysis["suggestions"] = [];
  let idx = 0;
  const mkId = () => `sug_${Date.now()}_${idx++}`;

  // No establishing shot?
  if (metrics.shotCount > 0 && !metrics.shotTypeDistribution["establishing"] && !metrics.shotTypeDistribution["wide"]) {
    suggestions.push({
      id: mkId(),
      type: "add_shot",
      priority: "high",
      title: "Add establishing shot",
      description: `Scene "${scene.title}" has no wide or establishing shot. Opening with one helps orient the viewer.`,
      metadata: { suggestedShotType: "establishing", insertPosition: 0 },
    });
  }

  // No close-ups in a scene with characters?
  const hasCharacters = scene.shots.some((s) => s.characterIds.length > 0);
  if (hasCharacters && !metrics.shotTypeDistribution["close"] && !metrics.shotTypeDistribution["extreme-close"]) {
    suggestions.push({
      id: mkId(),
      type: "add_shot",
      priority: "medium",
      title: "Add reaction close-up",
      description: "Characters are present but no close-up shots exist. A reaction close-up adds emotional depth.",
      metadata: { suggestedShotType: "close" },
    });
  }

  // Overly long shots (>8s)
  for (const shot of scene.shots) {
    if (shot.durationSec > 8) {
      suggestions.push({
        id: mkId(),
        type: "trim_shot",
        priority: "medium",
        title: `Trim long shot: ${shot.description.slice(0, 40)}...`,
        description: `Shot is ${shot.durationSec}s — consider trimming to 4-6s for better pacing.`,
        metadata: { shotId: shot.id, currentDuration: shot.durationSec, suggestedDuration: 5 },
      });
    }
  }

  // Repetitive shot types (same type > 60% of shots)
  for (const [type, count] of Object.entries(metrics.shotTypeDistribution)) {
    if (metrics.shotCount >= 3 && count / metrics.shotCount > 0.6) {
      suggestions.push({
        id: mkId(),
        type: "add_shot",
        priority: "medium",
        title: `Diversify shot types — too many ${type} shots`,
        description: `${count} of ${metrics.shotCount} shots are ${type}. Mix in different angles for visual variety.`,
        metadata: { dominantType: type, ratio: count / metrics.shotCount },
      });
    }
  }

  // Low camera variety
  if (metrics.shotCount >= 3 && metrics.cameraVariety < 0.3) {
    suggestions.push({
      id: mkId(),
      type: "pacing_adjustment",
      priority: "low",
      title: "Increase camera movement variety",
      description: "Most shots use the same camera movement. Consider adding dolly, tracking, or crane moves.",
      metadata: { currentVariety: metrics.cameraVariety },
    });
  }

  // Very short scene
  if (metrics.shotCount > 0 && metrics.totalDuration < 8) {
    suggestions.push({
      id: mkId(),
      type: "add_shot",
      priority: "low",
      title: "Scene may be too short",
      description: `Total duration is only ${metrics.totalDuration}s. Consider adding transition or buffer shots.`,
      metadata: {},
    });
  }

  return suggestions;
}
