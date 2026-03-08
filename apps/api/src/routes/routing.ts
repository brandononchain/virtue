import { Hono } from "hono";
import { store } from "../services/store.js";
import { registry } from "../services/orchestrator.js";
import {
  analyzeShotRequirements,
  recommendProvider,
  buildRoutingDecision,
  ROUTING_POLICIES,
} from "@virtue/routing-engine";
import {
  getAllProviderCapabilities,
  getProviderCapabilities,
} from "@virtue/provider-sdk";
import type { ProviderName, VirtueRoutingPolicy } from "@virtue/types";

export const routingRoutes = new Hono();

/**
 * POST /api/routing/recommend
 * Get a provider recommendation for a shot.
 * Accepts either a shotId (with projectId + sceneId) or raw shot config.
 */
routingRoutes.post("/recommend", async (c) => {
  const body = await c.req.json<{
    projectId?: string;
    sceneId?: string;
    shotId?: string;
    policy?: string;
    shot?: {
      shotType: string;
      description: string;
      prompt?: string;
      durationSec?: number;
      cameraMove?: string;
      characterIds?: string[];
    };
  }>();

  // Resolve the shot
  let shot;
  let characterCount = 0;
  let hasEnvironment = false;

  if (body.projectId && body.sceneId && body.shotId) {
    const project = store.getProject(body.projectId);
    if (!project) return c.json({ error: "Project not found" }, 404);

    const scene = project.scenes.find((s) => s.id === body.sceneId);
    if (!scene) return c.json({ error: "Scene not found" }, 404);

    shot = scene.shots.find((s) => s.id === body.shotId);
    if (!shot) return c.json({ error: "Shot not found" }, 404);

    characterCount = scene.context?.activeCharacterIds?.length ?? shot.characterIds.length;
    hasEnvironment = !!scene.context?.environmentId;
  } else if (body.shot) {
    // Construct a minimal shot from raw config
    shot = {
      id: "inline",
      sceneId: "inline",
      order: 0,
      shotType: body.shot.shotType as any,
      description: body.shot.description,
      prompt: body.shot.prompt || "",
      durationSec: body.shot.durationSec || 4,
      cameraMove: body.shot.cameraMove || "static",
      lens: "50mm",
      lighting: "natural",
      skills: [],
      characterIds: body.shot.characterIds || [],
      propIds: [],
    };
    characterCount = body.shot.characterIds?.length ?? 0;
  } else {
    return c.json({ error: "Provide either projectId+sceneId+shotId or shot config" }, 400);
  }

  // Resolve policy
  const policy = body.policy && body.policy in ROUTING_POLICIES
    ? ROUTING_POLICIES[body.policy]
    : ROUTING_POLICIES.balanced;

  // Determine available providers
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

  const decision = recommendProvider(shot, {
    policy,
    availableProviders,
    sceneContext: { characterCount, hasEnvironment },
  });

  return c.json(decision);
});

/**
 * GET /api/routing/providers/capabilities
 * Get capabilities for all known providers.
 */
routingRoutes.get("/providers/capabilities", async (c) => {
  const capabilities = getAllProviderCapabilities();

  // Augment with availability from the live registry
  const available = registry.list();
  const availabilityMap = new Map<string, boolean>();
  for (const p of available) {
    availabilityMap.set(p.name, await p.isAvailable());
  }

  const result = capabilities.map((cap) => ({
    ...cap,
    registered: availabilityMap.has(cap.provider),
    available: availabilityMap.get(cap.provider) ?? false,
  }));

  return c.json(result);
});

/**
 * GET /api/routing/providers/capabilities/:provider
 * Get capabilities for a specific provider.
 */
routingRoutes.get("/providers/capabilities/:provider", (c) => {
  const name = c.req.param("provider");
  const caps = getProviderCapabilities(name as ProviderName);
  if (!caps) return c.json({ error: "Unknown provider" }, 404);
  return c.json(caps);
});

/**
 * GET /api/routing/policies
 * List available routing policies.
 */
routingRoutes.get("/policies", (c) => {
  return c.json(ROUTING_POLICIES);
});

/**
 * GET /api/routing/renders/:id
 * Get routing decision metadata for a render job.
 */
routingRoutes.get("/renders/:id", (c) => {
  const job = store.getRenderJob(c.req.param("id"));
  if (!job) return c.json({ error: "Render job not found" }, 404);

  // Routing decision is stored in job metadata
  const routingDecision = (job as any).metadata?.routingDecision;
  if (!routingDecision) {
    return c.json({
      provider: job.provider,
      policy: "manual",
      rationale: "Provider was manually selected.",
      scores: [],
      manualOverride: true,
    });
  }

  return c.json(routingDecision);
});
