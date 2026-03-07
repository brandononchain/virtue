import type { VirtueSkill } from "@virtue/types";

/**
 * Match a generation task description to relevant skills.
 * Uses keyword overlap scoring against skill purpose, responsibilities, and name.
 */
export function matchSkills(
  query: string,
  skills: VirtueSkill[],
  maxResults = 5
): VirtueSkill[] {
  const queryTerms = tokenize(query);

  const scored = skills.map((skill) => {
    const corpus = [
      skill.name,
      skill.purpose,
      ...skill.responsibilities,
      ...skill.inputs,
      ...skill.outputs,
    ]
      .join(" ")
      .toLowerCase();

    const corpusTerms = new Set(tokenize(corpus));
    let score = 0;
    for (const term of queryTerms) {
      if (corpusTerms.has(term)) score += 1;
      // partial match bonus
      for (const ct of corpusTerms) {
        if (ct.includes(term) || term.includes(ct)) score += 0.5;
      }
    }
    return { skill, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((s) => s.skill);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}
