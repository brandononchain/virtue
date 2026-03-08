import { Hono } from "hono";
import {
  analyzeScene,
  suggestAdditionalShots,
  suggestPromptImprovements,
  suggestRetryStrategies,
  optimizeScenePacing,
  extractHighlights,
  generateTrailer,
} from "@virtue/autonomous-engine";
import { store } from "../services/store";

export const autonomousRoutes = new Hono();

function findScene(projectId: string, sceneId: string) {
  const project = store.getProject(projectId);
  if (!project) return { project: undefined, scene: undefined };
  const scene = project.scenes.find((s) => s.id === sceneId);
  return { project, scene };
}

function findShot(projectId: string, sceneId: string, shotId: string) {
  const { project, scene } = findScene(projectId, sceneId);
  if (!scene) return { project, scene: undefined, shot: undefined };
  const shot = scene.shots.find((s) => s.id === shotId);
  return { project, scene, shot };
}

// ─── Scene Analysis ────────────────────────────────────

autonomousRoutes.post("/analyze-scene", async (c) => {
  const { projectId, sceneId } = await c.req.json();
  if (!projectId || !sceneId) {
    return c.json({ error: "projectId and sceneId are required" }, 400);
  }
  const { scene } = findScene(projectId, sceneId);
  if (!scene) return c.json({ error: "Scene not found" }, 404);

  const analysis = analyzeScene(scene);
  return c.json(analysis);
});

// ─── Shot Suggestions ──────────────────────────────────

autonomousRoutes.post("/suggest-shots", async (c) => {
  const { projectId, sceneId } = await c.req.json();
  if (!projectId || !sceneId) {
    return c.json({ error: "projectId and sceneId are required" }, 400);
  }
  const { scene } = findScene(projectId, sceneId);
  if (!scene) return c.json({ error: "Scene not found" }, 404);

  const suggestions = suggestAdditionalShots(scene);
  return c.json(suggestions);
});

// ─── Prompt Improvement ────────────────────────────────

autonomousRoutes.post("/improve-prompt", async (c) => {
  const { projectId, sceneId, shotId } = await c.req.json();
  if (!projectId || !sceneId || !shotId) {
    return c.json({ error: "projectId, sceneId, and shotId are required" }, 400);
  }
  const { shot } = findShot(projectId, sceneId, shotId);
  if (!shot) return c.json({ error: "Shot not found" }, 404);

  const improvement = suggestPromptImprovements(shot);
  return c.json(improvement);
});

// ─── Render Retry ──────────────────────────────────────

autonomousRoutes.post("/retry-render", async (c) => {
  const { projectId, sceneId, shotId, renderId } = await c.req.json();
  if (!projectId || !sceneId || !shotId) {
    return c.json({ error: "projectId, sceneId, and shotId are required" }, 400);
  }
  const { shot } = findShot(projectId, sceneId, shotId);
  if (!shot) return c.json({ error: "Shot not found" }, 404);

  let renderError: string | undefined;
  let currentProvider: string | undefined;

  if (renderId) {
    const renderJob = store.getRenderJob(renderId);
    if (renderJob) {
      renderError = renderJob.error;
      currentProvider = renderJob.provider;
    }
  }

  const result = suggestRetryStrategies(shot, renderError, currentProvider);
  return c.json(result);
});

// ─── Pacing Optimization ───────────────────────────────

autonomousRoutes.post("/optimize-pacing", async (c) => {
  const { projectId, sceneId } = await c.req.json();
  if (!projectId || !sceneId) {
    return c.json({ error: "projectId and sceneId are required" }, 400);
  }
  const { scene } = findScene(projectId, sceneId);
  if (!scene) return c.json({ error: "Scene not found" }, 404);

  const analysis = optimizeScenePacing(scene);
  return c.json(analysis);
});

// ─── Highlights ────────────────────────────────────────

autonomousRoutes.post("/extract-highlights", async (c) => {
  const { projectId, sceneId } = await c.req.json();
  if (!projectId || !sceneId) {
    return c.json({ error: "projectId and sceneId are required" }, 400);
  }
  const { scene } = findScene(projectId, sceneId);
  if (!scene) return c.json({ error: "Scene not found" }, 404);

  const highlights = extractHighlights(scene);
  return c.json(highlights);
});

// ─── Trailer Generator ────────────────────────────────

autonomousRoutes.post("/generate-trailer", async (c) => {
  const { projectId, title } = await c.req.json();
  if (!projectId) {
    return c.json({ error: "projectId is required" }, 400);
  }
  const project = store.getProject(projectId);
  if (!project) return c.json({ error: "Project not found" }, 404);

  if (project.scenes.length === 0) {
    return c.json({ error: "Project has no scenes to build a trailer from" }, 400);
  }

  const trailer = generateTrailer(projectId, project.scenes, title);
  return c.json(trailer);
});
