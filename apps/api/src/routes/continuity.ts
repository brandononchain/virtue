import { Hono } from "hono";
import { store } from "../services/store.js";
import {
  registerCharacter,
  updateCharacter,
  removeCharacter,
  registerEnvironment,
  updateEnvironment,
  removeEnvironment,
  registerProp,
  updateProp,
  removeProp,
  setSceneContext,
  resolveContinuityContext,
  applyContinuityToPrompt,
} from "@virtue/continuity-engine";
import type { SceneContext } from "@virtue/types";

export const continuityRoutes = new Hono();

// ─── Characters ─────────────────────────────────────────

// List characters for a project
continuityRoutes.get("/:projectId/characters", (c) => {
  const project = store.getProject(c.req.param("projectId"));
  if (!project) return c.json({ error: "Project not found" }, 404);
  return c.json(project.characters ?? []);
});

// Create character
continuityRoutes.post("/:projectId/characters", async (c) => {
  const project = store.getProject(c.req.param("projectId"));
  if (!project) return c.json({ error: "Project not found" }, 404);

  const body = await c.req.json();
  const { project: updated, character } = registerCharacter(project, body);
  store.saveProject(updated);
  return c.json(character, 201);
});

// Update character
continuityRoutes.put("/:projectId/characters/:charId", async (c) => {
  const project = store.getProject(c.req.param("projectId"));
  if (!project) return c.json({ error: "Project not found" }, 404);

  const body = await c.req.json();
  const updated = updateCharacter(project, c.req.param("charId"), body);
  store.saveProject(updated);
  const char = updated.characters?.find(
    (ch) => ch.id === c.req.param("charId"),
  );
  return c.json(char);
});

// Delete character
continuityRoutes.delete("/:projectId/characters/:charId", (c) => {
  const project = store.getProject(c.req.param("projectId"));
  if (!project) return c.json({ error: "Project not found" }, 404);

  const updated = removeCharacter(project, c.req.param("charId"));
  store.saveProject(updated);
  return c.json({ ok: true });
});

// ─── Environments ───────────────────────────────────────

// List environments for a project
continuityRoutes.get("/:projectId/environments", (c) => {
  const project = store.getProject(c.req.param("projectId"));
  if (!project) return c.json({ error: "Project not found" }, 404);
  return c.json(project.environments ?? []);
});

// Create environment
continuityRoutes.post("/:projectId/environments", async (c) => {
  const project = store.getProject(c.req.param("projectId"));
  if (!project) return c.json({ error: "Project not found" }, 404);

  const body = await c.req.json();
  const { project: updated, environment } = registerEnvironment(project, body);
  store.saveProject(updated);
  return c.json(environment, 201);
});

// Update environment
continuityRoutes.put("/:projectId/environments/:envId", async (c) => {
  const project = store.getProject(c.req.param("projectId"));
  if (!project) return c.json({ error: "Project not found" }, 404);

  const body = await c.req.json();
  const updated = updateEnvironment(project, c.req.param("envId"), body);
  store.saveProject(updated);
  const env = updated.environments?.find(
    (e) => e.id === c.req.param("envId"),
  );
  return c.json(env);
});

// Delete environment
continuityRoutes.delete("/:projectId/environments/:envId", (c) => {
  const project = store.getProject(c.req.param("projectId"));
  if (!project) return c.json({ error: "Project not found" }, 404);

  const updated = removeEnvironment(project, c.req.param("envId"));
  store.saveProject(updated);
  return c.json({ ok: true });
});

// ─── Props ──────────────────────────────────────────────

// List props for a project
continuityRoutes.get("/:projectId/props", (c) => {
  const project = store.getProject(c.req.param("projectId"));
  if (!project) return c.json({ error: "Project not found" }, 404);
  return c.json(project.props ?? []);
});

// Create prop
continuityRoutes.post("/:projectId/props", async (c) => {
  const project = store.getProject(c.req.param("projectId"));
  if (!project) return c.json({ error: "Project not found" }, 404);

  const body = await c.req.json();
  const { project: updated, prop } = registerProp(project, body);
  store.saveProject(updated);
  return c.json(prop, 201);
});

// Update prop
continuityRoutes.put("/:projectId/props/:propId", async (c) => {
  const project = store.getProject(c.req.param("projectId"));
  if (!project) return c.json({ error: "Project not found" }, 404);

  const body = await c.req.json();
  const updated = updateProp(project, c.req.param("propId"), body);
  store.saveProject(updated);
  const prop = updated.props?.find((p) => p.id === c.req.param("propId"));
  return c.json(prop);
});

// Delete prop
continuityRoutes.delete("/:projectId/props/:propId", (c) => {
  const project = store.getProject(c.req.param("projectId"));
  if (!project) return c.json({ error: "Project not found" }, 404);

  const updated = removeProp(project, c.req.param("propId"));
  store.saveProject(updated);
  return c.json({ ok: true });
});

// ─── Scene Context ──────────────────────────────────────

// Get scene context (resolved)
continuityRoutes.get("/:projectId/scenes/:sceneId/context", (c) => {
  const project = store.getProject(c.req.param("projectId"));
  if (!project) return c.json({ error: "Project not found" }, 404);

  const scene = project.scenes.find(
    (s) => s.id === c.req.param("sceneId"),
  );
  if (!scene) return c.json({ error: "Scene not found" }, 404);

  const resolved = resolveContinuityContext(scene, project);
  return c.json({ context: scene.context, resolved });
});

// Update scene context
continuityRoutes.put("/:projectId/scenes/:sceneId/context", async (c) => {
  const project = store.getProject(c.req.param("projectId"));
  if (!project) return c.json({ error: "Project not found" }, 404);

  const sceneId = c.req.param("sceneId");
  const scene = project.scenes.find((s) => s.id === sceneId);
  if (!scene) return c.json({ error: "Scene not found" }, 404);

  const body = await c.req.json<SceneContext>();
  const updated = setSceneContext(project, sceneId, body);
  store.saveProject(updated);

  const updatedScene = updated.scenes.find((s) => s.id === sceneId);
  const resolved = updatedScene
    ? resolveContinuityContext(updatedScene, updated)
    : null;
  return c.json({ context: body, resolved });
});

// ─── Prompt Preview ─────────────────────────────────────

// Preview enriched prompt for a shot
continuityRoutes.get(
  "/:projectId/scenes/:sceneId/shots/:shotId/enriched-prompt",
  (c) => {
    const project = store.getProject(c.req.param("projectId"));
    if (!project) return c.json({ error: "Project not found" }, 404);

    const scene = project.scenes.find(
      (s) => s.id === c.req.param("sceneId"),
    );
    if (!scene) return c.json({ error: "Scene not found" }, 404);

    const shot = scene.shots.find(
      (s) => s.id === c.req.param("shotId"),
    );
    if (!shot) return c.json({ error: "Shot not found" }, 404);

    const ctx = resolveContinuityContext(scene, project);
    const result = applyContinuityToPrompt(shot, ctx);
    return c.json(result);
  },
);
