import type {
  VirtueShot,
  VirtueShotRequirements,
  VirtueRoutingDecision,
  VirtueRoutingPolicy,
  VirtueRoutingScore,
  ProviderName,
} from "@virtue/types";
import { nowISO } from "@virtue/validation";
import { getAllProviderCapabilities } from "@virtue/provider-sdk";
import { analyzeShotRequirements } from "./analyze.js";
import { scoreProviderForShot } from "./scoring.js";
import { getDefaultPolicy } from "./policies.js";

export interface RoutingContext {
  policy?: VirtueRoutingPolicy;
  availableProviders?: ProviderName[];
  sceneContext?: {
    characterCount?: number;
    hasEnvironment?: boolean;
    hasReferenceAssets?: boolean;
  };
}

/**
 * Recommend the best provider for a shot.
 * Returns the top-scoring available provider.
 */
export function recommendProvider(
  shot: VirtueShot,
  context?: RoutingContext,
): VirtueRoutingDecision {
  const policy = context?.policy || getDefaultPolicy();
  const requirements = analyzeShotRequirements(shot, context?.sceneContext);
  return buildRoutingDecision(requirements, policy, context?.availableProviders);
}

/**
 * Build a routing decision from pre-analyzed requirements.
 * Scores all providers and selects the best available one.
 */
export function buildRoutingDecision(
  requirements: VirtueShotRequirements,
  policy: VirtueRoutingPolicy,
  availableProviders?: ProviderName[],
): VirtueRoutingDecision {
  const allCapabilities = getAllProviderCapabilities();

  // Score all providers
  const scores: VirtueRoutingScore[] = allCapabilities.map((cap) => {
    const score = scoreProviderForShot(cap, requirements, policy);
    const isAvailable = availableProviders
      ? availableProviders.includes(cap.provider)
      : true;
    return { ...score, available: isAvailable };
  });

  // Sort by score descending
  scores.sort((a, b) => b.totalScore - a.totalScore);

  // Select best available provider
  const bestAvailable = scores.find((s) => s.available);
  const selected = bestAvailable || scores[0];

  // Build explanation
  const rationale = buildRationale(selected, requirements, policy, scores);

  return {
    selectedProvider: selected.provider,
    policy: policy.mode,
    rationale,
    scores,
    requirements,
    manualOverride: false,
    createdAt: nowISO(),
  };
}

/**
 * Generate a human-readable rationale for the routing decision.
 */
function buildRationale(
  selected: VirtueRoutingScore,
  requirements: VirtueShotRequirements,
  policy: VirtueRoutingPolicy,
  allScores: VirtueRoutingScore[],
): string {
  const parts: string[] = [];

  parts.push(`Selected ${selected.displayName}`);

  // Describe the shot characteristics
  const traits: string[] = [];

  if (requirements.wideCinematicScene) traits.push("wide cinematic");
  if (requirements.dialogueCloseup) traits.push("dialogue close-up");
  if (requirements.continuityCritical) traits.push("continuity-critical");
  if (requirements.realismLevel > 0.7) traits.push("photoreal");
  if (requirements.stylizationLevel > 0.4) traits.push("stylized");
  if (requirements.actionComplexity > 0.5) traits.push("high-action");
  if (requirements.imageConditioningNeeded) traits.push("image-conditioned");
  if (requirements.characterComplexity > 0.5) traits.push("character-heavy");

  if (traits.length > 0) {
    parts.push(`for this ${traits.join(", ")} shot`);
  }

  // Describe the key scoring factors
  const topFactors: string[] = [];
  const breakdown = selected.breakdown;
  const sortedFactors = Object.entries(breakdown)
    .filter(([, v]) => v >= 0.8)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  for (const [key] of sortedFactors) {
    const readable = key.replace(/([A-Z])/g, " $1").toLowerCase().trim();
    topFactors.push(readable);
  }

  if (topFactors.length > 0) {
    parts.push(`due to strong ${topFactors.join(", ")} scores`);
  }

  // Policy influence
  if (policy.mode !== "balanced") {
    const modeLabel = policy.mode.replace("auto_", "").replace("_", " ");
    parts.push(`(${modeLabel} priority)`);
  }

  // Score comparison
  const runner = allScores.find(
    (s) => s.provider !== selected.provider && s.available,
  );
  if (runner) {
    const diff = Math.round((selected.totalScore - runner.totalScore) * 100);
    if (diff > 0) {
      parts.push(`— scored ${diff}pts above ${runner.displayName}`);
    }
  }

  return parts.join(" ") + ".";
}
