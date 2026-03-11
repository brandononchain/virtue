import { Hono } from "hono";
import {
  allTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByDifficulty,
  searchTemplates,
  getCategories,
  getAllTags,
  agents,
  getAgentById,
  runAgent,
} from "@virtue/template-library";
import type {
  TemplateCategory,
  AgentRunInput,
} from "@virtue/template-library";

export const templateRoutes = new Hono();

// GET /templates — list all templates with optional filters
templateRoutes.get("/", (c) => {
  const category = c.req.query("category") as TemplateCategory | undefined;
  const difficulty = c.req.query("difficulty") as
    | "beginner"
    | "intermediate"
    | "advanced"
    | undefined;
  const q = c.req.query("q");

  let results = allTemplates;

  if (category) {
    results = results.filter((t) => t.category === category);
  }
  if (difficulty) {
    results = results.filter((t) => t.difficulty === difficulty);
  }
  if (q) {
    const searched = searchTemplates(q);
    const searchedIds = new Set(searched.map((t) => t.id));
    results = results.filter((t) => searchedIds.has(t.id));
  }

  return c.json({ templates: results, total: results.length });
});

// GET /templates/categories — list available categories
templateRoutes.get("/categories", (c) => {
  return c.json({ categories: getCategories() });
});

// GET /templates/tags — list all unique tags
templateRoutes.get("/tags", (c) => {
  return c.json({ tags: getAllTags() });
});

// GET /templates/:id — get single template
templateRoutes.get("/:id", (c) => {
  const template = getTemplateById(c.req.param("id"));
  if (!template) {
    return c.json({ error: "Template not found" }, 404);
  }
  return c.json(template);
});

// GET /agents — list all agents
templateRoutes.get("/agents", (c) => {
  // Note: this route is mounted under /api/templates, so full path = /api/templates/agents
  return c.json({ agents });
});

// GET /agents/:id — get single agent
templateRoutes.get("/agents/:id", (c) => {
  const agent = getAgentById(c.req.param("id"));
  if (!agent) {
    return c.json({ error: "Agent not found" }, 404);
  }
  return c.json(agent);
});

// POST /agents/run — run an agent to generate a plan
templateRoutes.post("/agents/run", async (c) => {
  const body = await c.req.json<AgentRunInput>();

  if (!body.agentId) {
    return c.json({ error: "agentId is required" }, 400);
  }

  try {
    const output = runAgent(body);
    return c.json(output);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return c.json({ error: message }, 400);
  }
});
