import type { CinematicTemplate, TemplateCategory } from "./types.js";
import { filmTemplates } from "./templates/film.js";
import { filmExtendedTemplates } from "./templates/film-extended.js";
import { commercialTemplates } from "./templates/commercial.js";
import { commercialExtendedTemplates } from "./templates/commercial-extended.js";
import { gamingTemplates } from "./templates/gaming.js";
import { gamingExtendedTemplates } from "./templates/gaming-extended.js";
import { socialTemplates } from "./templates/social.js";
import { socialExtendedTemplates } from "./templates/social-extended.js";
import { environmentTemplates } from "./templates/environment.js";
import { environmentExtendedTemplates } from "./templates/environment-extended.js";
import { characterTemplates } from "./templates/characters.js";
import { characterExtendedTemplates } from "./templates/characters-extended.js";
import { corporateTemplates } from "./templates/corporate.js";
import { corporateExtendedTemplates } from "./templates/corporate-extended.js";
import { miscExtendedTemplates } from "./templates/misc-extended.js";

/** All templates in the library. */
export const allTemplates: CinematicTemplate[] = [
  ...filmTemplates,
  ...filmExtendedTemplates,
  ...commercialTemplates,
  ...commercialExtendedTemplates,
  ...gamingTemplates,
  ...gamingExtendedTemplates,
  ...socialTemplates,
  ...socialExtendedTemplates,
  ...environmentTemplates,
  ...environmentExtendedTemplates,
  ...characterTemplates,
  ...characterExtendedTemplates,
  ...corporateTemplates,
  ...corporateExtendedTemplates,
  ...miscExtendedTemplates,
];

/** Fast lookup map built once on import. */
const templateMap = new Map<string, CinematicTemplate>(
  allTemplates.map((t) => [t.id, t]),
);

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

export function getTemplateById(id: string): CinematicTemplate | undefined {
  return templateMap.get(id);
}

export function getTemplatesByCategory(
  category: TemplateCategory,
): CinematicTemplate[] {
  return allTemplates.filter((t) => t.category === category);
}

export function getTemplatesByDifficulty(
  difficulty: "beginner" | "intermediate" | "advanced",
): CinematicTemplate[] {
  return allTemplates.filter((t) => t.difficulty === difficulty);
}

export function searchTemplates(query: string): CinematicTemplate[] {
  const lower = query.toLowerCase();
  return allTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(lower) ||
      t.description.toLowerCase().includes(lower) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lower)),
  );
}

export function getTemplateCount(): number {
  return allTemplates.length;
}

export function getCategories(): TemplateCategory[] {
  return [...new Set(allTemplates.map((t) => t.category))];
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  for (const t of allTemplates) {
    for (const tag of t.tags) {
      tagSet.add(tag);
    }
  }
  return [...tagSet].sort();
}
