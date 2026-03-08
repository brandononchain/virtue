import type { VirtueShot, VirtueShotRequirements, SceneContext } from "@virtue/types";

/** Keywords that indicate high-motion content */
const HIGH_MOTION_KEYWORDS = [
  "chase", "run", "fight", "explosion", "crash", "fly", "action",
  "fast", "quick", "sprint", "jump", "fall", "dive", "spin",
];

/** Keywords that indicate stylized/surreal content */
const STYLIZED_KEYWORDS = [
  "dream", "surreal", "abstract", "fantasy", "magical", "neon",
  "noir", "anime", "cartoon", "painterly", "ethereal", "psychedelic",
];

/** Keywords that indicate photorealistic content */
const REALISM_KEYWORDS = [
  "photorealistic", "realistic", "documentary", "natural", "real",
  "cinematic", "film", "raw", "authentic", "lifelike",
];

/** Camera moves that require high motion handling */
const HIGH_MOTION_CAMERA = [
  "tracking", "dolly", "crane", "steadicam", "handheld",
  "whip-pan", "zoom", "push-in", "pull-out", "orbit",
];

/**
 * Analyze a shot and its context to determine technical requirements.
 * This is deterministic — no LLM needed.
 */
export function analyzeShotRequirements(
  shot: VirtueShot,
  context?: {
    sceneContext?: SceneContext;
    characterCount?: number;
    hasEnvironment?: boolean;
    hasReferenceAssets?: boolean;
  },
): VirtueShotRequirements {
  const text = `${shot.description} ${shot.prompt}`.toLowerCase();
  const charCount = context?.characterCount ?? shot.characterIds.length;

  // Shot type analysis
  const isCloseup = shot.shotType === "close" || shot.shotType === "extreme-close";
  const isWide = shot.shotType === "wide" || shot.shotType === "establishing" || shot.shotType === "aerial";
  const isDialogueCloseup = isCloseup && (
    text.includes("dialogue") || text.includes("speaking") ||
    text.includes("talking") || text.includes("conversation") ||
    shot.shotType === "over-shoulder"
  );

  // Motion analysis
  const hasHighMotionKeywords = HIGH_MOTION_KEYWORDS.some((k) => text.includes(k));
  const hasHighMotionCamera = HIGH_MOTION_CAMERA.includes(shot.cameraMove.toLowerCase());
  const actionComplexity = clamp(
    (hasHighMotionKeywords ? 0.4 : 0) +
    (hasHighMotionCamera ? 0.3 : 0) +
    (shot.cameraMove !== "static" ? 0.2 : 0) +
    (text.includes("complex") || text.includes("intricate") ? 0.1 : 0),
  );

  // Style analysis
  const stylizationSignals = STYLIZED_KEYWORDS.filter((k) => text.includes(k)).length;
  const realismSignals = REALISM_KEYWORDS.filter((k) => text.includes(k)).length;
  const stylizationLevel = clamp(stylizationSignals * 0.2);
  const realismLevel = clamp(
    0.5 + realismSignals * 0.15 - stylizationSignals * 0.1,
  );

  // Character complexity
  const characterComplexity = clamp(
    (charCount > 0 ? 0.3 : 0) +
    (charCount > 1 ? 0.2 : 0) +
    (charCount > 3 ? 0.2 : 0) +
    (isCloseup && charCount > 0 ? 0.2 : 0) +
    (isDialogueCloseup ? 0.1 : 0),
  );

  // Environment complexity
  const environmentComplexity = clamp(
    (isWide ? 0.4 : 0.2) +
    (context?.hasEnvironment ? 0.2 : 0) +
    (text.includes("panoramic") || text.includes("landscape") ? 0.2 : 0) +
    (text.includes("detailed") || text.includes("intricate") ? 0.1 : 0) +
    (shot.shotType === "aerial" ? 0.1 : 0),
  );

  // Continuity assessment
  const continuityCritical =
    charCount > 0 && (isCloseup || isDialogueCloseup || shot.characterIds.length > 0);

  return {
    shotType: shot.shotType,
    framing: isCloseup ? "tight" : isWide ? "wide" : "standard",
    movement: shot.cameraMove,
    duration: shot.durationSec,
    realismLevel,
    stylizationLevel,
    continuityCritical,
    referenceAssetsPresent: context?.hasReferenceAssets ?? false,
    environmentComplexity,
    characterComplexity,
    actionComplexity,
    dialogueCloseup: isDialogueCloseup,
    wideCinematicScene: isWide,
    imageConditioningNeeded: context?.hasReferenceAssets ?? false,
    turnaroundPriority: 0.5,
    costSensitivity: 0.5,
  };
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}
