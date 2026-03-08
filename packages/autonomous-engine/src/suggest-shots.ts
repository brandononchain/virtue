import type { VirtueScene, VirtueShotSuggestion } from "@virtue/types";

/**
 * Suggest additional shots for a scene based on its current composition.
 */
export function suggestAdditionalShots(scene: VirtueScene): VirtueShotSuggestion[] {
  const suggestions: VirtueShotSuggestion[] = [];
  const shots = scene.shots;
  let idx = 0;
  const mkId = () => `shotsg_${Date.now()}_${idx++}`;

  const hasType = (t: string) => shots.some((s) => s.shotType === t);
  const lastShot = shots[shots.length - 1];
  const hasCharacters = shots.some((s) => s.characterIds.length > 0);
  const location = scene.location || "the scene";
  const mood = scene.mood || "cinematic";

  // Establishing shot if missing
  if (shots.length > 0 && !hasType("establishing") && !hasType("wide")) {
    suggestions.push({
      id: mkId(),
      sceneId: scene.id,
      shotType: "establishing",
      description: `Wide establishing shot of ${location}`,
      promptSuggestion: `Cinematic establishing shot of ${location}, ${mood} atmosphere, wide angle, golden hour lighting, photorealistic`,
      durationSec: 4,
      cameraMove: "drone_forward",
      reason: "Opens the scene and orients the viewer in the environment.",
      insertAfterShotId: undefined,
      recommendedSkills: [],
      priority: "high",
    });
  }

  // Reaction close-up if characters present but no close-ups
  if (hasCharacters && !hasType("close") && !hasType("extreme-close")) {
    const charShot = shots.find((s) => s.characterIds.length > 0);
    suggestions.push({
      id: mkId(),
      sceneId: scene.id,
      shotType: "close",
      description: "Reaction close-up on character face",
      promptSuggestion: `Cinematic close-up of a character's face reacting, shallow depth of field, ${mood} lighting, emotional expression, 85mm lens`,
      durationSec: 3,
      cameraMove: "slow_push",
      reason: "Adds emotional weight and human connection to the scene.",
      insertAfterShotId: charShot?.id,
      recommendedSkills: [],
      priority: "medium",
    });
  }

  // Cutaway / insert if scene has 3+ shots but no variety
  if (shots.length >= 3 && !hasType("pov")) {
    suggestions.push({
      id: mkId(),
      sceneId: scene.id,
      shotType: "pov",
      description: `POV insert showing detail from ${location}`,
      promptSuggestion: `Point of view shot, ${mood} detail, close focus on environmental element, cinematic lighting, shallow depth of field`,
      durationSec: 2,
      cameraMove: "static",
      reason: "Adds visual rhythm and breaks up longer sequences.",
      insertAfterShotId: shots[Math.floor(shots.length / 2)]?.id,
      recommendedSkills: [],
      priority: "low",
    });
  }

  // Closing wide if last shot is a close-up
  if (lastShot && (lastShot.shotType === "close" || lastShot.shotType === "extreme-close")) {
    suggestions.push({
      id: mkId(),
      sceneId: scene.id,
      shotType: "wide",
      description: `Closing wide of ${location} — pull back to context`,
      promptSuggestion: `Wide shot pulling back from the scene, ${location}, ${mood} atmosphere, cinematic composition, natural lighting`,
      durationSec: 4,
      cameraMove: "crane_up",
      reason: "Provides a satisfying visual conclusion and establishes spatial context.",
      insertAfterShotId: lastShot.id,
      recommendedSkills: [],
      priority: "low",
    });
  }

  // Over-shoulder if dialogue-like scene with 2+ characters
  const multiCharShots = shots.filter((s) => s.characterIds.length >= 2);
  if (multiCharShots.length > 0 && !hasType("over-shoulder")) {
    suggestions.push({
      id: mkId(),
      sceneId: scene.id,
      shotType: "over-shoulder",
      description: "Over-shoulder shot for character interaction",
      promptSuggestion: `Over-the-shoulder shot, two characters in conversation, shallow depth of field, ${mood} lighting, cinematic framing`,
      durationSec: 4,
      cameraMove: "static",
      reason: "Classic framing for dialogue and character interaction scenes.",
      insertAfterShotId: multiCharShots[0]?.id,
      recommendedSkills: [],
      priority: "medium",
    });
  }

  return suggestions;
}
