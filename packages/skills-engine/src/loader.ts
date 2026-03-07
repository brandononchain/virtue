import { readdir, readFile } from "node:fs/promises";
import { join, basename } from "node:path";
import type { VirtueSkill } from "@virtue/types";
import { parseSkillMarkdown } from "./parser";

/**
 * Load all markdown skill files from a directory.
 * Non-.md files are silently skipped.
 */
export async function loadSkillsFromDirectory(
  dirPath: string
): Promise<VirtueSkill[]> {
  const entries = await readdir(dirPath);
  const mdFiles = entries.filter((f) => f.endsWith(".md"));

  const skills = await Promise.all(
    mdFiles.map(async (file) => {
      const content = await readFile(join(dirPath, file), "utf-8");
      return parseSkillMarkdown(file, content);
    })
  );

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Load skills from the default Skills directory at repo root.
 */
export async function loadSkills(): Promise<VirtueSkill[]> {
  const skillsDir = join(process.cwd(), "Skills");
  return loadSkillsFromDirectory(skillsDir);
}
