import { Hono } from "hono";
import {
  createWorld,
  getWorldState,
  updateCharacterState,
  updateEnvironmentState,
  updatePropState,
  addStoryEvent,
  setActiveConditions,
  simulateSceneImpact,
  initializeWorldFromProject,
  getSimulationContext,
  buildSimulationPromptFragment,
} from "@virtue/simulation-engine";
import { store } from "../services/store";

export const simulationRoutes = new Hono();

// ─── World State ───────────────────────────────────────

simulationRoutes.get("/world/:projectId", (c) => {
  const projectId = c.req.param("projectId");
  const project = store.getProject(projectId);
  if (!project) return c.json({ error: "Project not found" }, 404);

  let world = getWorldState(projectId);
  if (!world) {
    world = initializeWorldFromProject(project);
  }
  return c.json(world);
});

simulationRoutes.post("/world/:projectId/initialize", (c) => {
  const projectId = c.req.param("projectId");
  const project = store.getProject(projectId);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const world = initializeWorldFromProject(project);
  return c.json(world);
});

simulationRoutes.post("/world/:projectId/update", async (c) => {
  const projectId = c.req.param("projectId");
  const project = store.getProject(projectId);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const { characters, environments, props, conditions } = await c.req.json();

  // Apply character updates
  if (characters) {
    for (const { characterId, ...updates } of characters) {
      updateCharacterState(projectId, characterId, updates);
    }
  }

  // Apply environment updates
  if (environments) {
    for (const { environmentId, ...updates } of environments) {
      updateEnvironmentState(projectId, environmentId, updates);
    }
  }

  // Apply prop updates
  if (props) {
    for (const { propId, ...updates } of props) {
      updatePropState(projectId, propId, updates);
    }
  }

  // Set conditions
  if (conditions) {
    setActiveConditions(projectId, conditions);
  }

  const world = getWorldState(projectId);
  return c.json(world);
});

// ─── Scene Simulation ──────────────────────────────────

simulationRoutes.post("/simulate/scene", async (c) => {
  const { projectId, sceneId } = await c.req.json();
  if (!projectId || !sceneId) {
    return c.json({ error: "projectId and sceneId are required" }, 400);
  }

  const project = store.getProject(projectId);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const scene = project.scenes.find((s) => s.id === sceneId);
  if (!scene) return c.json({ error: "Scene not found" }, 404);

  const world = simulateSceneImpact(project, scene);
  return c.json(world);
});

// ─── Simulation Context ────────────────────────────────

simulationRoutes.get("/context/:projectId/:sceneId", (c) => {
  const { projectId, sceneId } = c.req.param();
  const project = store.getProject(projectId);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const scene = project.scenes.find((s) => s.id === sceneId);
  if (!scene) return c.json({ error: "Scene not found" }, 404);

  const ctx = getSimulationContext(project, scene);
  const promptFragment = buildSimulationPromptFragment(ctx);

  return c.json({ ...ctx, promptFragment });
});

// ─── Story Events ──────────────────────────────────────

simulationRoutes.post("/world/:projectId/event", async (c) => {
  const projectId = c.req.param("projectId");
  const { sceneId, description, affectedCharacters, affectedEnvironments, affectedProps } = await c.req.json();

  if (!description) {
    return c.json({ error: "description is required" }, 400);
  }

  const world = addStoryEvent(projectId, {
    sceneId: sceneId || "manual",
    description,
    affectedCharacters: affectedCharacters || [],
    affectedEnvironments: affectedEnvironments || [],
    affectedProps: affectedProps || [],
  });

  if (!world) return c.json({ error: "World not found — initialize it first" }, 404);
  return c.json(world);
});
