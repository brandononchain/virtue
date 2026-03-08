/**
 * Shot planner — breaks parsed scenes into cinematic shot plans.
 * Uses deterministic heuristics to assign shot types, camera moves,
 * lenses, lighting, and durations based on scene content analysis.
 */

import type { DirectorShotPlan } from "@virtue/types";
import type { ParsedScene } from "./parser.js";

// ─── Scene Density Analysis ─────────────────────────────

interface SceneAnalysis {
  wordCount: number;
  sentenceCount: number;
  hasDialogue: boolean;
  hasAction: boolean;
  hasEmotion: boolean;
  hasEnvironment: boolean;
  hasMovement: boolean;
  density: "sparse" | "moderate" | "dense";
  tone: "contemplative" | "neutral" | "intense";
}

function analyzeScene(scene: ParsedScene): SceneAnalysis {
  const text = scene.body;
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  const lower = text.toLowerCase();

  const hasDialogue = /[""].*[""]/.test(text) || /^\s*[A-Z]{2,}/.test(text);
  const hasAction =
    /\b(?:runs?|jumps?|fights?|grabs?|chases?|falls?|shoots?|explodes?|crashes?|smashes?|punches?|kicks?|dives?|climbs?|escapes?|attacks?|dodges?|leaps?)\b/i.test(
      text,
    );
  const hasEmotion =
    /\b(?:tears?|cries?|laughs?|screams?|whispers?|trembles?|embraces?|grief|joy|fear|anger|sorrow|love|pain|hope|despair|lonely|tender)\b/i.test(
      text,
    );
  const hasEnvironment =
    /\b(?:rain|wind|fog|snow|sun|moon|stars?|fire|smoke|dust|water|waves?|clouds?|sky|light|shadow|darkness)\b/i.test(
      text,
    );
  const hasMovement =
    /\b(?:walks?|moves?|drives?|flies?|floats?|drifts?|wanders?|paces?|strides?|stumbles?|crawls?|runs?)\b/i.test(
      text,
    );

  const density =
    words.length > 100 ? "dense" : words.length > 40 ? "moderate" : "sparse";

  const tone = hasAction
    ? "intense"
    : hasEmotion
      ? "contemplative"
      : "neutral";

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    hasDialogue,
    hasAction,
    hasEmotion,
    hasEnvironment,
    hasMovement,
    density,
    tone,
  };
}

// ─── Shot Count Heuristics ──────────────────────────────

function determineShotCount(analysis: SceneAnalysis): number {
  let count: number;

  if (analysis.density === "dense") {
    count = analysis.hasAction ? 5 : 4;
  } else if (analysis.density === "moderate") {
    count = analysis.hasDialogue ? 3 : 2;
  } else {
    count = analysis.hasEmotion ? 2 : 1;
  }

  // Bonus shots for rich scenes
  if (analysis.hasDialogue && analysis.hasAction) count++;
  if (analysis.hasEnvironment && count < 2) count = 2;

  return Math.min(count, 6); // cap at 6 per scene
}

// ─── Shot Type Selection ────────────────────────────────

type ShotTypeValue =
  | "wide"
  | "medium"
  | "close"
  | "extreme-close"
  | "establishing"
  | "over-shoulder"
  | "pov"
  | "aerial";

interface ShotTemplate {
  shotType: ShotTypeValue;
  lens: string;
  cameraMove: string;
  durationBase: number;
  role: "establishing" | "subject" | "detail" | "reaction" | "closing";
}

// Classic shot progression templates based on scene type
const ESTABLISHING_TEMPLATES: ShotTemplate[] = [
  { shotType: "establishing", lens: "24mm", cameraMove: "crane-up", durationBase: 5, role: "establishing" },
  { shotType: "aerial", lens: "24mm", cameraMove: "drone-orbit", durationBase: 6, role: "establishing" },
  { shotType: "wide", lens: "35mm", cameraMove: "dolly-forward", durationBase: 4, role: "establishing" },
];

const SUBJECT_TEMPLATES: ShotTemplate[] = [
  { shotType: "medium", lens: "50mm", cameraMove: "static", durationBase: 4, role: "subject" },
  { shotType: "medium", lens: "50mm", cameraMove: "slow-push", durationBase: 4, role: "subject" },
  { shotType: "over-shoulder", lens: "85mm", cameraMove: "static", durationBase: 3, role: "subject" },
];

const DETAIL_TEMPLATES: ShotTemplate[] = [
  { shotType: "close", lens: "85mm", cameraMove: "static", durationBase: 3, role: "detail" },
  { shotType: "extreme-close", lens: "100mm macro", cameraMove: "static", durationBase: 2, role: "detail" },
  { shotType: "close", lens: "85mm", cameraMove: "slow-pan", durationBase: 3, role: "detail" },
];

const REACTION_TEMPLATES: ShotTemplate[] = [
  { shotType: "close", lens: "85mm", cameraMove: "static", durationBase: 3, role: "reaction" },
  { shotType: "medium", lens: "50mm", cameraMove: "static", durationBase: 3, role: "reaction" },
];

const ACTION_TEMPLATES: ShotTemplate[] = [
  { shotType: "pov", lens: "18mm", cameraMove: "handheld", durationBase: 3, role: "subject" },
  { shotType: "wide", lens: "24mm", cameraMove: "tracking", durationBase: 4, role: "subject" },
  { shotType: "medium", lens: "35mm", cameraMove: "handheld", durationBase: 3, role: "subject" },
];

const CLOSING_TEMPLATES: ShotTemplate[] = [
  { shotType: "wide", lens: "35mm", cameraMove: "pull-back", durationBase: 4, role: "closing" },
  { shotType: "medium", lens: "50mm", cameraMove: "static", durationBase: 4, role: "closing" },
  { shotType: "close", lens: "85mm", cameraMove: "static", durationBase: 3, role: "closing" },
];

function selectShotSequence(
  count: number,
  analysis: SceneAnalysis,
): ShotTemplate[] {
  const sequence: ShotTemplate[] = [];

  // First shot: always establishing
  const establ = analysis.hasMovement
    ? ESTABLISHING_TEMPLATES[1] // aerial for movement
    : ESTABLISHING_TEMPLATES[pickIndex(ESTABLISHING_TEMPLATES.length, 0)];
  sequence.push(establ);

  if (count === 1) return sequence;

  // Middle shots
  const middleCount = count - (count > 2 ? 2 : 1); // reserve one for closing if > 2

  for (let i = 0; i < middleCount; i++) {
    if (analysis.hasAction && i === 0) {
      sequence.push(ACTION_TEMPLATES[pickIndex(ACTION_TEMPLATES.length, i)]);
    } else if (analysis.hasDialogue && i > 0) {
      sequence.push(REACTION_TEMPLATES[pickIndex(REACTION_TEMPLATES.length, i)]);
    } else if (analysis.hasEmotion) {
      sequence.push(DETAIL_TEMPLATES[pickIndex(DETAIL_TEMPLATES.length, i)]);
    } else {
      sequence.push(SUBJECT_TEMPLATES[pickIndex(SUBJECT_TEMPLATES.length, i)]);
    }
  }

  // Last shot: closing
  if (count > 2) {
    if (analysis.hasEmotion) {
      sequence.push(CLOSING_TEMPLATES[2]); // close-up for emotional endings
    } else {
      sequence.push(CLOSING_TEMPLATES[pickIndex(CLOSING_TEMPLATES.length, count)]);
    }
  }

  return sequence;
}

function pickIndex(length: number, seed: number): number {
  return seed % length;
}

// ─── Lighting Inference ─────────────────────────────────

function inferLighting(scene: ParsedScene, analysis: SceneAnalysis): string {
  const text = scene.body.toLowerCase();
  const time = scene.timeOfDay;

  if (/\b(?:fire|flame|candle|torch|lantern)\b/.test(text)) return "warm practicals, fire-lit";
  if (/\b(?:neon|holograph|electric|glow)\b/.test(text)) return "neon + volumetric";
  if (/\b(?:fog|mist|haze)\b/.test(text)) return "diffused, volumetric fog";
  if (/\b(?:rain|storm)\b/.test(text)) return "overcast, wet reflections";
  if (/\b(?:sun|bright|harsh)\b/.test(text)) return "harsh natural sunlight";

  if (time === "dawn") return "golden hour, warm backlight";
  if (time === "dusk") return "golden hour, long shadows";
  if (time === "night") return "low-key, moonlight + practicals";

  if (analysis.tone === "contemplative") return "soft natural light, diffused";
  if (analysis.tone === "intense") return "high contrast, directional";

  return "natural ambient";
}

// ─── Mood Inference ─────────────────────────────────────

function inferMood(scene: ParsedScene, analysis: SceneAnalysis): string {
  const text = scene.body.toLowerCase();

  const moods: string[] = [];

  if (/\b(?:fear|terror|dread|horror|creep)\b/.test(text)) moods.push("tension");
  if (/\b(?:love|tender|gentle|embrace|kiss)\b/.test(text)) moods.push("tenderness");
  if (/\b(?:anger|rage|fury|violent)\b/.test(text)) moods.push("aggression");
  if (/\b(?:sad|sorrow|grief|mourn|loss|lonely)\b/.test(text)) moods.push("melancholy");
  if (/\b(?:joy|happy|laugh|celebrate|elat)\b/.test(text)) moods.push("joy");
  if (/\b(?:wonder|awe|magnificent|vast|enormous)\b/.test(text)) moods.push("awe");
  if (/\b(?:mystery|strange|unknown|hidden|secret)\b/.test(text)) moods.push("mystery");
  if (/\b(?:peace|calm|serene|quiet|still)\b/.test(text)) moods.push("serenity");
  if (/\b(?:chaos|panic|frantic|desperate)\b/.test(text)) moods.push("chaos");
  if (/\b(?:hope|light|dawn|new beginning)\b/.test(text)) moods.push("hope");

  if (moods.length === 0) {
    if (analysis.tone === "intense") return "tension, urgency";
    if (analysis.tone === "contemplative") return "introspection, stillness";
    return "neutral, observational";
  }

  return moods.slice(0, 3).join(", ");
}

// ─── Prompt Builder ─────────────────────────────────────

function buildPromptSeed(
  scene: ParsedScene,
  template: ShotTemplate,
  shotDesc: string,
  lighting: string,
): string {
  const parts: string[] = [];

  // Shot framing
  const frameDesc =
    template.shotType === "aerial"
      ? "Aerial cinematic shot"
      : template.shotType === "establishing"
        ? "Cinematic establishing shot"
        : template.shotType === "pov"
          ? "First-person POV shot"
          : template.shotType === "over-shoulder"
            ? "Over-the-shoulder shot"
            : `Cinematic ${template.shotType} shot`;

  parts.push(frameDesc);

  // Camera info
  if (template.cameraMove !== "static") {
    parts.push(`${template.cameraMove} camera movement`);
  }

  // Scene content
  parts.push(shotDesc);

  // Location context
  if (scene.location && scene.location !== "Unspecified Location") {
    parts.push(`set in ${scene.location}`);
  }

  // Time of day
  parts.push(`${scene.timeOfDay} atmosphere`);

  // Lighting
  parts.push(lighting + " lighting");

  // Quality tag
  parts.push("4K cinematic quality, photorealistic");

  return parts.join(", ");
}

// ─── Shot Description Generator ─────────────────────────

function generateShotDescriptions(
  scene: ParsedScene,
  count: number,
): string[] {
  const text = scene.body;
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  if (sentences.length === 0) {
    return Array(count).fill(text.slice(0, 120));
  }

  const descriptions: string[] = [];

  // First shot: use overall scene description
  descriptions.push(
    sentences.length > 1
      ? sentences.slice(0, 2).join(" ")
      : sentences[0],
  );

  // Distribute remaining sentences across shots
  for (let i = 1; i < count; i++) {
    const sentIdx = Math.min(
      i,
      sentences.length - 1,
    );
    descriptions.push(sentences[sentIdx]);
  }

  return descriptions.map((d) =>
    d.length > 200 ? d.slice(0, 197) + "..." : d,
  );
}

// ─── Shot Title Generator ───────────────────────────────

function generateShotTitle(
  sceneNumber: number,
  shotIndex: number,
  template: ShotTemplate,
): string {
  const roleLabels: Record<string, string> = {
    establishing: "Establishing",
    subject: "Subject",
    detail: "Detail",
    reaction: "Reaction",
    closing: "Closing",
  };

  return `S${sceneNumber} Shot ${shotIndex + 1} — ${roleLabels[template.role]}`;
}

// ─── Main Shot Plan Generator ───────────────────────────

export function generateShotPlan(scene: ParsedScene): DirectorShotPlan[] {
  const analysis = analyzeScene(scene);
  const shotCount = determineShotCount(analysis);
  const templates = selectShotSequence(shotCount, analysis);
  const descriptions = generateShotDescriptions(scene, shotCount);
  const lighting = inferLighting(scene, analysis);
  const mood = inferMood(scene, analysis);

  return templates.map((template, i) => {
    const desc = descriptions[i] || scene.body.slice(0, 100);
    const visualIntent =
      template.role === "establishing"
        ? `Reveal ${scene.location} in ${scene.timeOfDay} setting`
        : template.role === "detail"
          ? `Intimate detail capturing emotion and texture`
          : template.role === "closing"
            ? `Final framing to close the scene`
            : `Capture the scene's core action and subject`;

    return {
      shotTitle: generateShotTitle(scene.sceneNumber, i, template),
      shotType: template.shotType,
      description: desc,
      lens: template.lens,
      cameraMove: template.cameraMove,
      estimatedDuration: template.durationBase,
      visualIntent,
      lightingIntent: lighting,
      environmentNotes: scene.location !== "Unspecified Location" ? scene.location : "",
      characterNotes:
        scene.characters.length > 0
          ? `Characters: ${scene.characters.join(", ")}`
          : "",
      promptSeed: buildPromptSeed(scene, template, desc, lighting),
      attachedSkills: [],
    };
  });
}
