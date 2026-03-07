/**
 * Top-level director: takes raw text input and produces
 * a complete structured plan (scenes + shots + skills + prompts).
 */

import type {
  DirectorInput,
  DirectorOutput,
  DirectorScenePlan,
} from "@virtue/types";
import { createId, nowISO } from "@virtue/validation";
import { parseScreenplay, parseConcept, isScreenplayFormat } from "./parser.js";
import { generateShotPlan } from "./planner.js";
import { mapSkillsToAllShots } from "./skill-mapper.js";

/**
 * Build a complete director plan from raw input.
 */
export function buildDirectorPlan(input: DirectorInput): DirectorOutput {
  // Parse based on mode (or auto-detect for screenplay mode)
  const parsed =
    input.mode === "screenplay" || isScreenplayFormat(input.text)
      ? parseScreenplay(input.text)
      : parseConcept(input.text);

  // Generate shot plans for each scene and attach skills
  const scenes: DirectorScenePlan[] = parsed.map((scene) => {
    const rawShots = generateShotPlan(scene);
    const shots = mapSkillsToAllShots(rawShots);

    return {
      sceneNumber: scene.sceneNumber,
      title: scene.heading,
      location: scene.location,
      timeOfDay: scene.timeOfDay,
      mood: shots.length > 0 ? inferMoodFromShots(shots[0].lightingIntent, scene.body) : "neutral",
      description: scene.body.length > 300 ? scene.body.slice(0, 297) + "..." : scene.body,
      characters: scene.characters,
      shots,
    };
  });

  const totalShots = scenes.reduce((n, s) => n + s.shots.length, 0);
  const estimatedDuration = scenes.reduce(
    (sum, s) => sum + s.shots.reduce((d, shot) => d + shot.estimatedDuration, 0),
    0,
  );

  // Generate project name from input
  const projectName =
    input.projectName ||
    deriveProjectName(input.text);

  // Generate synopsis
  const synopsis = deriveSynopsis(input.text, scenes);

  return {
    id: createId(),
    input,
    projectName,
    synopsis,
    scenes,
    totalShots,
    estimatedDuration,
    createdAt: nowISO(),
  };
}

function deriveProjectName(text: string): string {
  // Try to use the first line if it looks like a title
  const firstLine = text.split("\n").find((l) => l.trim().length > 0)?.trim() || "";

  // If it's short and doesn't look like a scene heading, use it as title
  if (
    firstLine.length > 0 &&
    firstLine.length < 60 &&
    !firstLine.startsWith("INT.") &&
    !firstLine.startsWith("EXT.")
  ) {
    // Clean up quotes and formatting
    return firstLine.replace(/^["'"]|["'"]$/g, "").trim();
  }

  // Extract key nouns from the text for a generated title
  const words = text.slice(0, 200).split(/\s+/);
  const interestingWords = words.filter(
    (w) =>
      w.length > 4 &&
      /^[A-Z]/.test(w) &&
      !/^(?:The|This|That|There|Their|These|Those|Where|When|Which|While|After|Before)$/.test(w),
  );

  if (interestingWords.length > 0) {
    return interestingWords.slice(0, 3).join(" ");
  }

  return "Untitled Project";
}

function deriveSynopsis(text: string, scenes: DirectorScenePlan[]): string {
  if (text.length < 200) return text.trim();

  // Use first ~150 chars + scene count summary
  const opening = text.slice(0, 150).trim();
  const lastPeriod = opening.lastIndexOf(".");
  const clean = lastPeriod > 50 ? opening.slice(0, lastPeriod + 1) : opening + "...";

  return clean;
}

function inferMoodFromShots(lightingIntent: string, body: string): string {
  const lower = body.toLowerCase();
  const moods: string[] = [];

  if (/\b(?:fear|terror|dread)\b/.test(lower)) moods.push("tension");
  if (/\b(?:beauty|wonder|awe|magnificent)\b/.test(lower)) moods.push("awe");
  if (/\b(?:sad|sorrow|grief|loss)\b/.test(lower)) moods.push("melancholy");
  if (/\b(?:action|chase|fight|urgent)\b/.test(lower)) moods.push("urgency");
  if (/\b(?:love|tender|gentle)\b/.test(lower)) moods.push("tenderness");
  if (/\b(?:mystery|strange|unknown)\b/.test(lower)) moods.push("mystery");
  if (/\b(?:calm|peace|serene|quiet)\b/.test(lower)) moods.push("serenity");

  if (moods.length === 0) {
    if (lightingIntent.includes("warm")) return "warmth";
    if (lightingIntent.includes("cold") || lightingIntent.includes("moonlight")) return "isolation";
    return "contemplation";
  }

  return moods.slice(0, 2).join(", ");
}
