import { Hono } from "hono";
import { store } from "../services/store.js";
import { orchestrator, registry } from "../services/orchestrator.js";
import type { ProviderName } from "@virtue/types";

export const renderRoutes = new Hono();

// List available providers — registered before parameterized routes
renderRoutes.get("/providers", async (c) => {
  const providers = registry.list();
  const result = await Promise.all(
    providers.map(async (p) => ({
      name: p.name,
      displayName: p.displayName,
      available: await p.isAvailable(),
    }))
  );
  return c.json(result);
});

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
  const { projectId, sceneId, shotId, provider, prompt } = await c.req.json<{
    projectId: string;
    sceneId: string;
    shotId: string;
    provider?: ProviderName;
    prompt?: string;
  }>();

  const project = store.getProject(projectId);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const scene = project.scenes.find((s) => s.id === sceneId);
  if (!scene) return c.json({ error: "Scene not found" }, 404);

  const shot = scene.shots.find((s) => s.id === shotId);
  if (!shot) return c.json({ error: "Shot not found" }, 404);

  if (provider && !registry.has(provider)) {
    return c.json({ error: `Provider "${provider}" is not available` }, 400);
  }

  try {
    const job = await orchestrator.submitJob(projectId, shot, provider, prompt);
    store.saveRenderJob(job);
    return c.json(job, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Submission failed";
    return c.json({ error: message }, 500);
  }
});

// Poll render job (advance state)
renderRoutes.post("/:id/poll", async (c) => {
  const jobId = c.req.param("id");
  const job = await orchestrator.pollJob(jobId);
  if (!job) return c.json({ error: "Job not found" }, 404);
  store.saveRenderJob(job);
  return c.json(job);
});
