import { Hono } from "hono";
import { store } from "../services/store.js";
import {
  createTimeline,
  reorderShots,
  isTimelineReady,
} from "@virtue/timeline-engine";
import {
  submitSceneComposition,
  pollSceneComposition,
} from "../services/scene-composer.js";

export const sceneRoutes = new Hono();

/**
 * GET /api/scenes/:projectId/:sceneId/timeline
 * Get or auto-create a scene timeline.
 */
sceneRoutes.get("/:projectId/:sceneId/timeline", (c) => {
  const { projectId, sceneId } = c.req.param();

  const project = store.getProject(projectId);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const scene = project.scenes.find((s) => s.id === sceneId);
  if (!scene) return c.json({ error: "Scene not found" }, 404);

  // Return existing timeline or create one
  let timeline = store.getSceneTimelineBySceneId(sceneId);
  if (!timeline) {
    const renderJobs = store.listRenderJobs(projectId);
    timeline = createTimeline(projectId, scene, renderJobs);
    store.saveSceneTimeline(timeline);
  }

  return c.json(timeline);
});

/**
 * POST /api/scenes/:projectId/:sceneId/timeline
 * Create or refresh a scene timeline from current shots and renders.
 */
sceneRoutes.post("/:projectId/:sceneId/timeline", (c) => {
  const { projectId, sceneId } = c.req.param();

  const project = store.getProject(projectId);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const scene = project.scenes.find((s) => s.id === sceneId);
  if (!scene) return c.json({ error: "Scene not found" }, 404);

  const renderJobs = store.listRenderJobs(projectId);
  const timeline = createTimeline(projectId, scene, renderJobs);
  store.saveSceneTimeline(timeline);

  return c.json(timeline, 201);
});

/**
 * POST /api/scenes/:projectId/:sceneId/timeline/reorder
 * Reorder shots in the timeline.
 */
sceneRoutes.post("/:projectId/:sceneId/timeline/reorder", async (c) => {
  const { sceneId } = c.req.param();
  const { order } = await c.req.json<{ order: string[] }>();

  const timeline = store.getSceneTimelineBySceneId(sceneId);
  if (!timeline) return c.json({ error: "Timeline not found" }, 404);

  const updated = reorderShots(timeline, order);
  store.saveSceneTimeline(updated);

  return c.json(updated);
});

/**
 * POST /api/scenes/:projectId/:sceneId/compose
 * Trigger scene composition — concatenate all rendered shots into one video.
 */
sceneRoutes.post("/:projectId/:sceneId/compose", async (c) => {
  const { projectId, sceneId } = c.req.param();

  const project = store.getProject(projectId);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const scene = project.scenes.find((s) => s.id === sceneId);
  if (!scene) return c.json({ error: "Scene not found" }, 404);

  // Always refresh timeline to pick up latest render state
  const renderJobs = store.listRenderJobs(projectId);
  const timeline = createTimeline(projectId, scene, renderJobs);
  store.saveSceneTimeline(timeline);

  if (!isTimelineReady(timeline)) {
    return c.json(
      { error: "Not all shots have been rendered. Render all shots first." },
      400,
    );
  }

  try {
    const job = await submitSceneComposition(projectId, sceneId, timeline);
    return c.json(job, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Composition failed";
    return c.json({ error: message }, 500);
  }
});

/**
 * POST /api/scenes/compose/:jobId/poll
 * Advance/poll a scene composition job.
 */
sceneRoutes.post("/compose/:jobId/poll", async (c) => {
  const jobId = c.req.param("jobId");
  const job = await pollSceneComposition(jobId);
  if (!job) return c.json({ error: "Scene render job not found" }, 404);
  return c.json(job);
});

/**
 * GET /api/scenes/compose/:jobId
 * Get a scene render job by ID.
 */
sceneRoutes.get("/compose/:jobId", (c) => {
  const job = store.getSceneRenderJob(c.req.param("jobId"));
  if (!job) return c.json({ error: "Scene render job not found" }, 404);
  return c.json(job);
});

/**
 * GET /api/scenes/:projectId/jobs
 * List all scene render jobs for a project.
 */
sceneRoutes.get("/:projectId/jobs", (c) => {
  const jobs = store.listSceneRenderJobs(c.req.param("projectId"));
  return c.json(jobs);
});
