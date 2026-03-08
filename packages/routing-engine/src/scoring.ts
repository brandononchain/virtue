import type {
  VirtueShotRequirements,
  VirtueProviderCapabilities,
  VirtueRoutingPolicy,
  VirtueRoutingScore,
} from "@virtue/types";

const QUALITY_TIER_SCORE: Record<string, number> = {
  low: 0.25, medium: 0.5, high: 0.75, premium: 1.0,
};

const SPEED_TIER_SCORE: Record<string, number> = {
  slow: 0.25, medium: 0.5, fast: 1.0,
};

const COST_TIER_SCORE: Record<string, number> = {
  free: 1.0, low: 0.75, medium: 0.5, high: 0.25,
};

/**
 * Score a single provider for a given shot's requirements.
 * Returns a breakdown of scores across categories and a total weighted score.
 */
export function scoreProviderForShot(
  capabilities: VirtueProviderCapabilities,
  requirements: VirtueShotRequirements,
  policy: VirtueRoutingPolicy,
): VirtueRoutingScore {
  const breakdown: Record<string, number> = {};

  // ── Quality dimension ──────────────────────────────

  // Base quality tier
  breakdown.qualityTier = QUALITY_TIER_SCORE[capabilities.qualityTier] ?? 0.5;

  // Photorealism match
  if (requirements.realismLevel > 0.6) {
    breakdown.photorealism = capabilities.supportsPhotorealism ? 1.0 : 0.2;
  }

  // Stylization match
  if (requirements.stylizationLevel > 0.4) {
    breakdown.stylization = capabilities.supportsStylizedOutput ? 1.0 : 0.2;
  }

  // Character consistency (critical for continuity shots)
  if (requirements.continuityCritical) {
    breakdown.characterConsistency = capabilities.supportsCharacterConsistency ? 1.0 : 0.1;
  }

  // Camera control (important for specific movements)
  if (requirements.movement !== "static") {
    breakdown.cameraControl = capabilities.supportsFineCameraControl ? 0.9 : 0.4;
  }

  // High motion support
  if (requirements.actionComplexity > 0.5) {
    breakdown.highMotion = capabilities.supportsHighMotion ? 1.0 : 0.3;
  }

  // Image conditioning / reference images
  if (requirements.imageConditioningNeeded) {
    breakdown.imageConditioning = capabilities.supportsImageToVideo ? 1.0 : 0.0;
  }
  if (requirements.referenceAssetsPresent) {
    breakdown.referenceImages = capabilities.supportsReferenceImages ? 1.0 : 0.1;
  }

  // Duration support
  if (requirements.duration > capabilities.maxDurationSeconds) {
    breakdown.durationSupport = 0.0;
  } else if (requirements.duration > capabilities.maxDurationSeconds * 0.8) {
    breakdown.durationSupport = 0.5;
  } else {
    breakdown.durationSupport = 1.0;
  }

  // Wide cinematic scene bonus
  if (requirements.wideCinematicScene) {
    breakdown.wideCinematic = capabilities.supportsPhotorealism ? 0.8 : 0.4;
  }

  // Dialogue closeup — character consistency matters most
  if (requirements.dialogueCloseup) {
    breakdown.dialogueCloseup = capabilities.supportsCharacterConsistency ? 1.0 : 0.3;
  }

  // ── Speed dimension ────────────────────────────────
  breakdown.speedTier = SPEED_TIER_SCORE[capabilities.speedTier] ?? 0.5;
  if (requirements.turnaroundPriority > 0.7) {
    breakdown.fastTurnaround = capabilities.supportsFastTurnaround ? 1.0 : 0.3;
  }

  // ── Cost dimension ─────────────────────────────────
  breakdown.costTier = COST_TIER_SCORE[capabilities.costTier] ?? 0.5;

  // ── Compute weighted total ─────────────────────────

  // Categorize scores
  const qualityKeys = [
    "qualityTier", "photorealism", "stylization", "characterConsistency",
    "cameraControl", "highMotion", "imageConditioning", "referenceImages",
    "durationSupport", "wideCinematic", "dialogueCloseup",
  ];
  const speedKeys = ["speedTier", "fastTurnaround"];
  const costKeys = ["costTier"];

  const qualityScore = averageScores(breakdown, qualityKeys);
  const speedScore = averageScores(breakdown, speedKeys);
  const costScore = averageScores(breakdown, costKeys);

  const totalScore =
    qualityScore * policy.qualityWeight +
    speedScore * policy.speedWeight +
    costScore * policy.costWeight;

  return {
    provider: capabilities.provider,
    displayName: capabilities.displayName,
    totalScore: Math.round(totalScore * 100) / 100,
    breakdown,
    available: true,
  };
}

function averageScores(
  breakdown: Record<string, number>,
  keys: string[],
): number {
  const present = keys.filter((k) => k in breakdown);
  if (present.length === 0) return 0.5;
  const sum = present.reduce((s, k) => s + breakdown[k], 0);
  return sum / present.length;
}
