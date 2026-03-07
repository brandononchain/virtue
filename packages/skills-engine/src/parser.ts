import type { VirtueSkill } from "@virtue/types";

/**
 * Parse a markdown skill file into structured VirtueSkill data.
 * Handles malformed or legacy files gracefully — missing sections
 * are returned as empty arrays/strings rather than throwing.
 */
export function parseSkillMarkdown(
  filename: string,
  content: string
): VirtueSkill {
  const slug = filename.replace(/\.md$/i, "").toLowerCase();
  const id = `skill-${slug}`;

  const name = extractTitle(content) || titleFromFilename(slug);
  const purpose = extractSection(content, "Purpose");
  const responsibilities = extractList(content, "Responsibilities");
  const inputs = extractList(content, "Inputs");
  const outputs = extractList(content, "Output") .length
    ? extractList(content, "Output")
    : extractList(content, "Outputs");
  const examples = extractExamples(content);

  return {
    id,
    name,
    slug,
    purpose,
    responsibilities,
    inputs,
    outputs,
    examples,
    raw: content,
  };
}

function extractTitle(md: string): string {
  const match = md.match(/^#\s+(?:Skill:\s*)?(.+)/m);
  return match ? match[1].trim() : "";
}

function titleFromFilename(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function extractSection(md: string, heading: string): string {
  const regex = new RegExp(
    `##\\s+${heading}[\\s\\S]*?\\n([\\s\\S]*?)(?=\\n##\\s|$)`,
    "i"
  );
  const match = md.match(regex);
  if (!match) return "";
  return match[1].trim();
}

function extractList(md: string, heading: string): string[] {
  const body = extractSection(md, heading);
  if (!body) return [];
  const lines = body.split("\n");
  return lines
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter((line) => line.length > 0);
}

function extractExamples(md: string): string[] {
  const body = extractSection(md, "Example");
  if (!body) return [];
  return [body];
}
