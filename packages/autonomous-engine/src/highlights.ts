import type { VirtueScene, VirtueHighlight } from "@virtue/types";

const ACTION_KEYWORDS = [
  "explosion", "chase", "fight", "crash", "run", "jump", "fall",
  "fire", "battle", "attack", "strike", "impact",
];

const EMOTION_KEYWORDS = [
  "tears", "cry", "smile", "laugh", "embrace", "kiss", "whisper",
  "scream", "shock", "reveal", "confront",
];

const VISUAL_KEYWORDS = [
  "aerial", "sunset", "sunrise", "panorama", "landscape",
  "silhouette", "reflection", "fog", "rain", "snow",
  "golden hour", "neon", "fire",
];

/**
 * Extract highlight-worthy shots from a scene.
 */
export function extractHighlights(scene: VirtueScene): VirtueHighlight[] {
  const highlights: VirtueHighlight[] = [];

  for (const shot of scene.shots) {
    const text = `${shot.description} ${shot.prompt}`.toLowerCase();
    let score = 0;
    const tags: string[] = [];
    const reasons: string[] = [];

    // Action content scoring
    const actionHits = ACTION_KEYWORDS.filter((kw) => text.includes(kw));
    if (actionHits.length > 0) {
      score += 0.3 + actionHits.length * 0.1;
      tags.push("action");
      reasons.push(`action content (${actionHits.join(", ")})`);
    }

    // Emotional content scoring
    const emotionHits = EMOTION_KEYWORDS.filter((kw) => text.includes(kw));
    if (emotionHits.length > 0) {
      score += 0.25 + emotionHits.length * 0.1;
      tags.push("emotional");
      reasons.push(`emotional moment (${emotionHits.join(", ")})`);
    }

    // Visual spectacle scoring
    const visualHits = VISUAL_KEYWORDS.filter((kw) => text.includes(kw));
    if (visualHits.length > 0) {
      score += 0.2 + visualHits.length * 0.08;
      tags.push("visual");
      reasons.push(`visual impact (${visualHits.join(", ")})`);
    }

    // Shot type bonuses
    if (shot.shotType === "establishing" || shot.shotType === "aerial") {
      score += 0.15;
      tags.push("cinematic");
      reasons.push("cinematic establishing shot");
    }
    if (shot.shotType === "close" || shot.shotType === "extreme-close") {
      score += 0.1;
      tags.push("intimate");
      reasons.push("intimate close-up");
    }

    // Camera movement bonus
    if (shot.cameraMove !== "static") {
      score += 0.1;
      tags.push("dynamic");
    }

    // Normalize score to 0-1
    score = Math.min(Math.round(score * 100) / 100, 1);

    // Only include shots that score above threshold
    if (score >= 0.3) {
      highlights.push({
        id: `hl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        sceneId: scene.id,
        shotId: shot.id,
        score,
        reason: reasons.length > 0 ? reasons.join("; ") : "Visually engaging shot",
        tags,
        durationSec: shot.durationSec,
      });
    }
  }

  // Sort by score descending
  return highlights.sort((a, b) => b.score - a.score);
}
