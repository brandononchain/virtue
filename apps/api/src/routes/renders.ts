import { Hono } from "hono";
import { store } from "../services/store";
import { orchestrator } from "../services/orchestrator";

export const renderRoutes = new Hono();

// List render jobs
renderRoutes.get("/", (c) => {
  const projectId = c.req.query("projectId");
  return c.json(store.listRenderJobs(projectId));
});

// Get render job
renderRoutes.get("/:id", (c) => {
  const job = store.getRenderJob(c.req.param("id"));
  if (!job) return c.json({ error: "Job not found" }, 404);
  return c.json(job);
});

// Submit render job for a shot
renderRoutes.post("/", async (c) => {
  const { projectId, sceneId, shotId } = await c.req.json<{
    projectId: string;
    sceneId: string;
    shotId: string;
  }>();

  const project = store.getProject(projectId);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const scene = project.scenes.find((s) => s.id === sceneId);
  if (!scene) return c.json({ error: "Scene not found" }, 404);

  const shot = scene.shots.find((s) => s.id === shotId);
  if (!shot) return c.json({ error: "Shot not found" }, 404);

  const job = await orchestrator.submitJob(projectId, shot);
  store.saveRenderJob(job);
  return c.json(job, 201);
});

// Poll render job (advance mock state)
renderRoutes.post("/:id/poll", async (c) => {
  const jobId = c.req.param("id");
  const job = await orchestrator.pollJob(jobId);
  if (!job) return c.json({ error: "Job not found" }, 404);
  store.saveRenderJob(job);
  return c.json(job);
});
