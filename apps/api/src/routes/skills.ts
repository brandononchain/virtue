import { Hono } from "hono";
import { join } from "node:path";
import { loadSkillsFromDirectory, matchSkills } from "@virtue/skills-engine";
import { store } from "../services/store";

export const skillRoutes = new Hono();

let loaded = false;

async function ensureSkillsLoaded() {
  if (loaded) return;
  const skillsDir = join(process.cwd(), "Skills");
  try {
    store.skills = await loadSkillsFromDirectory(skillsDir);
    loaded = true;
  } catch {
    // Skills directory may not be relative to cwd — try repo root
    const altDir = join(process.cwd(), "../../Skills");
    store.skills = await loadSkillsFromDirectory(altDir);
    loaded = true;
  }
}

// List all skills
skillRoutes.get("/", async (c) => {
  await ensureSkillsLoaded();
  return c.json(store.skills);
});

// Get skill by slug
skillRoutes.get("/:slug", async (c) => {
  await ensureSkillsLoaded();
  const skill = store.skills.find((s) => s.slug === c.req.param("slug"));
  if (!skill) return c.json({ error: "Skill not found" }, 404);
  return c.json(skill);
});

// Match skills to a query
skillRoutes.post("/match", async (c) => {
  await ensureSkillsLoaded();
  const { query, maxResults } = await c.req.json<{
    query: string;
    maxResults?: number;
  }>();
  const results = matchSkills(query, store.skills, maxResults);
  return c.json(results);
});
