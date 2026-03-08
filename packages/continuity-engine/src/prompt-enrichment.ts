import type { VirtueCharacter, VirtueEnvironment, VirtueProp, VirtueShot } from "@virtue/types";
import type { ResolvedContinuityContext } from "./context.js";

/**
 * Build a character description fragment for prompt injection.
 */
function describeCharacter(c: VirtueCharacter): string {
  const parts: string[] = [];
  if (c.name) parts.push(c.name);
  if (c.gender || c.age) {
    const demo = [c.gender, c.age].filter(Boolean).join(" ");
    parts.push(demo);
  }
  if (c.ethnicity) parts.push(c.ethnicity);
  if (c.appearance) parts.push(c.appearance);
  if (c.clothing) parts.push(`wearing ${c.clothing}`);
  return parts.join(", ");
}

/**
 * Build an environment description fragment for prompt injection.
 */
function describeEnvironment(e: VirtueEnvironment): string {
  const parts: string[] = [];
  if (e.name) parts.push(e.name);
  if (e.locationType) parts.push(e.locationType);
  if (e.description) parts.push(e.description);
  if (e.weather) parts.push(e.weather);
  if (e.lightingStyle) parts.push(`${e.lightingStyle} lighting`);
  if (e.colorPalette.length > 0) {
    parts.push(`color palette: ${e.colorPalette.join(", ")}`);
  }
  return parts.join(". ");
}

/**
 * Build a prop description fragment for prompt injection.
 */
function describeProp(p: VirtueProp): string {
  const parts: string[] = [p.name];
  if (p.material) parts.push(p.material);
  if (p.condition) parts.push(p.condition);
  if (p.description) parts.push(p.description);
  return parts.join(", ");
}

export interface EnrichmentResult {
  /** The enriched prompt with continuity details appended. */
  enrichedPrompt: string;
  /** The original prompt, preserved for transparency. */
  originalPrompt: string;
  /** The continuity fragment that was injected. */
  continuityFragment: string;
}

/**
 * Enrich a shot prompt with continuity context.
 *
 * The original prompt is preserved intact. Continuity details are appended
 * as a structured suffix so the enrichment is reversible and transparent.
 */
export function applyContinuityToPrompt(
  shot: VirtueShot,
  context: ResolvedContinuityContext,
): EnrichmentResult {
  const originalPrompt = shot.continuityOverride || shot.prompt || shot.description;

  const fragments: string[] = [];

  // Character continuity
  const shotCharacters = context.characters.filter(
    (c) => shot.characterIds.length === 0 || shot.characterIds.includes(c.id),
  );
  if (shotCharacters.length > 0) {
    const charDescs = shotCharacters.map(describeCharacter);
    fragments.push(`Characters: ${charDescs.join("; ")}`);
  }

  // Environment continuity
  if (context.environment) {
    fragments.push(`Environment: ${describeEnvironment(context.environment)}`);
  }

  // Prop continuity
  const shotProps = context.props.filter(
    (p) => shot.propIds?.length === 0 || shot.propIds?.includes(p.id),
  );
  if (shotProps.length > 0) {
    fragments.push(`Props: ${shotProps.map(describeProp).join("; ")}`);
  }

  // Lighting and mood
  if (context.lightingIntent) {
    fragments.push(`Lighting: ${context.lightingIntent}`);
  }
  if (context.moodIntent) {
    fragments.push(`Mood: ${context.moodIntent}`);
  }

  const continuityFragment = fragments.join(". ");

  if (!continuityFragment) {
    return { enrichedPrompt: originalPrompt, originalPrompt, continuityFragment: "" };
  }

  const enrichedPrompt = `${originalPrompt}\n\n[Continuity context] ${continuityFragment}`;

  return { enrichedPrompt, originalPrompt, continuityFragment };
}

/**
 * Strip continuity context from an enriched prompt, returning the original.
 */
export function stripContinuityFromPrompt(enrichedPrompt: string): string {
  const marker = "\n\n[Continuity context] ";
  const idx = enrichedPrompt.indexOf(marker);
  if (idx === -1) return enrichedPrompt;
  return enrichedPrompt.slice(0, idx);
}
