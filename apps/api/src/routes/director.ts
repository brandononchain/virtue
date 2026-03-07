import { Hono } from "hono";
import { buildDirectorPlan } from "@virtue/director-engine";
import { createProject, addScene, addShot } from "@virtue/storyboard-engine";
import { store } from "../services/store.js";
import type { DirectorInput, DirectorOutput, VirtueProject } from "@virtue/types";

export const directorRoutes = new Hono();

// In-memory plan storage
const plans = new Map<string, DirectorOutput>();

/**
 * POST /api/director/plan
 * Generate a structured scene + shot plan from script or concept text.
 */
directorRoutes.post("/plan", async (c) => {
  const body = await c.req.json<{
    text: string;
    mode?: "screenplay" | "concept";
    projectName?: string;
  }>();

  if (!body.text || body.text.trim().length === 0) {
    return c.json({ error: "Input text is required" }, 400);
  }

  const input: DirectorInput = {
    text: body.text,
    mode: body.mode || "concept",
    projectName: body.projectName,
  };

  try {
    const plan = buildDirectorPlan(input);
    plans.set(plan.id, plan);
    return c.json(plan, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Planning failed";
    return c.json({ error: message }, 500);
  }
});

/**
 * GET /api/director/plans/:id
 * Retrieve a previously generated plan.
 */
directorRoutes.get("/plans/:id", (c) => {
  const plan = plans.get(c.req.param("id"));
  if (!plan) return c.json({ error: "Plan not found" }, 404);
  return c.json(plan);
});

/**
 * POST /api/director/plans/:id/create-project
 * Create a full project from a director plan.
 * Populates scenes, shots, prompts, skills, and metadata.
 */
directorRoutes.post("/plans/:id/create-project", (c) => {
  const plan = plans.get(c.req.param("id"));
  if (!plan) return c.json({ error: "Plan not found" }, 404);

  let project = createProject(plan.projectName, plan.synopsis);
  project = { ...project, screenplay: plan.input.text };

  for (const scenePlan of plan.scenes) {
    project = addScene(project, scenePlan.title, {
      description: scenePlan.description,
      location: scenePlan.location,
      timeOfDay: scenePlan.timeOfDay,
      mood: scenePlan.mood,
      characters: scenePlan.characters,
    });

    const scene = project.scenes[project.scenes.length - 1];

    for (const shotPlan of scenePlan.shots) {
      project = addShot(project, scene.id, {
        shotType: shotPlan.shotType as any,
        description: shotPlan.description,
        prompt: shotPlan.promptSeed,
        durationSec: shotPlan.estimatedDuration,
        cameraMove: shotPlan.cameraMove,
        lens: shotPlan.lens,
        lighting: shotPlan.lightingIntent,
        skills: shotPlan.attachedSkills,
        characterIds: [],
    propIds: [],
      });
    }
  }

  store.saveProject(project);
  return c.json(project, 201);
});

/**
 * POST /api/director/create-project
 * One-shot: generate plan + create project in a single call.
 */
directorRoutes.post("/create-project", async (c) => {
  const body = await c.req.json<{
    text: string;
    mode?: "screenplay" | "concept";
    projectName?: string;
  }>();

  if (!body.text || body.text.trim().length === 0) {
    return c.json({ error: "Input text is required" }, 400);
  }

  const input: DirectorInput = {
    text: body.text,
    mode: body.mode || "concept",
    projectName: body.projectName,
  };

  try {
    const plan = buildDirectorPlan(input);
    plans.set(plan.id, plan);

    let project = createProject(plan.projectName, plan.synopsis);
    project = { ...project, screenplay: plan.input.text };

    for (const scenePlan of plan.scenes) {
      project = addScene(project, scenePlan.title, {
        description: scenePlan.description,
        location: scenePlan.location,
        timeOfDay: scenePlan.timeOfDay,
        mood: scenePlan.mood,
        characters: scenePlan.characters,
      });

      const scene = project.scenes[project.scenes.length - 1];

      for (const shotPlan of scenePlan.shots) {
        project = addShot(project, scene.id, {
          shotType: shotPlan.shotType as any,
          description: shotPlan.description,
          prompt: shotPlan.promptSeed,
          durationSec: shotPlan.estimatedDuration,
          cameraMove: shotPlan.cameraMove,
          lens: shotPlan.lens,
          lighting: shotPlan.lightingIntent,
          skills: shotPlan.attachedSkills,
          characterIds: [],
    propIds: [],
        });
      }
    }

    store.saveProject(project);
    return c.json({ plan, project }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return c.json({ error: message }, 500);
  }
});
