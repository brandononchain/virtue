import { Hono } from "hono";
import { store } from "../services/store.js";
import { orchestrator, registry } from "../services/orchestrator.js";
import type { ProviderName } from "@virtue/types";
import { resolveContinuityContext, applyContinuityToPrompt } from "@virtue/continuity-engine";
import { recommendProvider, ROUTING_POLICIES } from "@virtue/routing-engine";

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
  const { projectId, sceneId, shotId, provider, prompt, routingMode } = await c.req.json<{
    projectId: string;
    sceneId: string;
    shotId: string;
    provider?: ProviderName;
    prompt?: string;
    routingMode?: string;
  }>();

  const project = store.getProject(projectId);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const scene = project.scenes.find((s) => s.id === sceneId);
  if (!scene) return c.json({ error: "Scene not found" }, 404);

  const shot = scene.shots.find((s) => s.id === shotId);
  if (!shot) return c.json({ error: "Shot not found" }, 404);

  // Determine provider — routing or manual
  let selectedProvider = provider;
  let routingDecision;

  if (!provider && routingMode && routingMode !== "manual") {
    // Use routing engine to select provider
    const policy = ROUTING_POLICIES[routingMode] || ROUTING_POLICIES.balanced;

    const available = registry.list();
    const availableNames = await Promise.all(
      available.map(async (p) => ({
        name: p.name,
        isAvailable: await p.isAvailable(),
      })),
    );
    const availableProviders = availableNames
      .filter((p) => p.isAvailable)
      .map((p) => p.name as ProviderName);

    const characterCount = scene.context?.activeCharacterIds?.length ?? shot.characterIds.length;
    const hasEnvironment = !!scene.context?.environmentId;

    routingDecision = recommendProvider(shot, {
      policy,
      availableProviders,
      sceneContext: { characterCount, hasEnvironment },
    });

    selectedProvider = routingDecision.selectedProvider;
  }

  if (selectedProvider && !registry.has(selectedProvider)) {
    return c.json({ error: `Provider "${selectedProvider}" is not available` }, 400);
  }

  try {
    // Enrich prompt with continuity context
    const continuityCtx = resolveContinuityContext(scene, project);
    const { enrichedPrompt } = applyContinuityToPrompt(shot, continuityCtx);
    const finalPrompt = prompt || enrichedPrompt;

    const job = await orchestrator.submitJob(projectId, shot, selectedProvider, finalPrompt);

    // Attach routing decision metadata to job
    if (routingDecision) {
      const enrichedJob = {
        ...job,
        metadata: { routingDecision },
      };
      store.saveRenderJob(enrichedJob as any);
      return c.json(enrichedJob, 201);
    }

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
