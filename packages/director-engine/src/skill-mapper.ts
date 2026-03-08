/**
 * Maps director shot plans to relevant Virtue Skills
 * based on shot properties — deterministic keyword rules.
 */

import type { DirectorShotPlan } from "@virtue/types";

interface SkillRule {
  skillId: string;
  match: (shot: DirectorShotPlan) => boolean;
}

const SKILL_RULES: SkillRule[] = [
  // cinematic-direction: always relevant for structured shots
  {
    skillId: "skill-cinematic-direction",
    match: (shot) =>
      ["establishing", "wide", "aerial"].includes(shot.shotType) ||
      shot.cameraMove !== "static",
  },

  // camera-choreography: moving camera shots
  {
    skillId: "skill-camera-choreography",
    match: (shot) =>
      shot.cameraMove !== "static" ||
      ["aerial", "pov"].includes(shot.shotType),
  },

  // lighting-design: any shot with explicit lighting intent
  {
    skillId: "skill-lighting-design",
    match: (shot) =>
      shot.lightingIntent !== "natural ambient" &&
      shot.lightingIntent.length > 0,
  },

  // character-performance: shots with characters or dialogue
  {
    skillId: "skill-character-performance",
    match: (shot) =>
      shot.characterNotes.length > 0 ||
      ["close", "extreme-close", "over-shoulder", "medium"].includes(shot.shotType),
  },

  // temporal-consistency: multi-shot sequences, close-ups, detail shots
  {
    skillId: "skill-temporal-consistency",
    match: (shot) =>
      ["close", "extreme-close"].includes(shot.shotType) ||
      shot.estimatedDuration > 4,
  },

  // scene-simulation: environment-heavy shots
  {
    skillId: "skill-scene-simulation",
    match: (shot) =>
      shot.environmentNotes.length > 0 ||
      ["establishing", "wide", "aerial"].includes(shot.shotType),
  },

  // physics-engine: action/movement-heavy shots
  {
    skillId: "skill-physics-engine",
    match: (shot) =>
      /\b(?:run|chase|fall|crash|explode|fight|jump|fly|float|drift|collide|shatter|pour|rain|wind|fire|smoke|dust|waves?)\b/i.test(
        shot.description + " " + shot.promptSeed,
      ),
  },

  // visual-style-engine: stylized or atmospheric shots
  {
    skillId: "skill-visual-style-engine",
    match: (shot) =>
      /\b(?:neon|noir|gothic|minimalist|surreal|abstract|stylized|cinematic|filmic|grain|vintage|retro|futuristic|cyberpunk)\b/i.test(
        shot.description + " " + shot.promptSeed,
      ) || shot.lightingIntent.includes("volumetric"),
  },

  // post-production: closing shots, transitions, grading-heavy
  {
    skillId: "skill-post-production",
    match: (shot) =>
      /\b(?:fade|dissolve|transition|grade|color|tone|final|closing)\b/i.test(
        shot.description + " " + shot.visualIntent,
      ),
  },

  // storyboard-generator: establishing and planning shots
  {
    skillId: "skill-storyboard-generator",
    match: (shot) =>
      shot.shotType === "establishing" || shot.shotType === "wide",
  },
];

/**
 * Map skills to a shot plan based on its properties.
 * Returns an array of skill IDs.
 */
export function mapSkillsToShot(shot: DirectorShotPlan): string[] {
  const matched: string[] = [];
  for (const rule of SKILL_RULES) {
    if (rule.match(shot)) {
      matched.push(rule.skillId);
    }
  }
  // Deduplicate and cap at 5
  return [...new Set(matched)].slice(0, 5);
}

/**
 * Map skills to all shots in a plan.
 */
export function mapSkillsToAllShots(
  shots: DirectorShotPlan[],
): DirectorShotPlan[] {
  return shots.map((shot) => ({
    ...shot,
    attachedSkills: mapSkillsToShot(shot),
  }));
}
