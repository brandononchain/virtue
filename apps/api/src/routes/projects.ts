import { Hono } from "hono";
import { createProject, addScene, addShot } from "@virtue/storyboard-engine";
import { store } from "../services/store";

export const projectRoutes = new Hono();

// List all projects
projectRoutes.get("/", (c) => {
  return c.json(store.listProjects());
});

// Get project by ID
projectRoutes.get("/:id", (c) => {
  const project = store.getProject(c.req.param("id"));
  if (!project) return c.json({ error: "Project not found" }, 404);
  return c.json(project);
});

// Create project
projectRoutes.post("/", async (c) => {
  const body = await c.req.json<{ name: string; description?: string }>();
  const project = createProject(body.name, body.description);
  store.saveProject(project);
  return c.json(project, 201);
});

// Add scene to project
projectRoutes.post("/:id/scenes", async (c) => {
  const project = store.getProject(c.req.param("id"));
  if (!project) return c.json({ error: "Project not found" }, 404);

  const body = await c.req.json<{
    title: string;
    description?: string;
    location?: string;
    timeOfDay?: string;
    mood?: string;
  }>();

  const updated = addScene(project, body.title, {
    description: body.description,
    location: body.location,
    timeOfDay: body.timeOfDay,
    mood: body.mood,
  });

  store.saveProject(updated);
  return c.json(updated, 201);
});

// Add shot to scene
projectRoutes.post("/:id/scenes/:sceneId/shots", async (c) => {
  const project = store.getProject(c.req.param("id"));
  if (!project) return c.json({ error: "Project not found" }, 404);

  const sceneId = c.req.param("sceneId");
  const scene = project.scenes.find((s) => s.id === sceneId);
  if (!scene) return c.json({ error: "Scene not found" }, 404);

  const body = await c.req.json<{
    shotType: string;
    description: string;
    prompt?: string;
    durationSec?: number;
    cameraMove?: string;
    lens?: string;
    lighting?: string;
  }>();

  const updated = addShot(project, sceneId, {
    shotType: body.shotType as any,
    description: body.description,
    prompt: body.prompt || "",
    durationSec: body.durationSec || 4,
    cameraMove: body.cameraMove || "static",
    lens: body.lens || "50mm",
    lighting: body.lighting || "natural",
    skills: [],
    characterIds: [],
    propIds: [],
  });

  store.saveProject(updated);
  return c.json(updated, 201);
});

// Delete project
projectRoutes.delete("/:id", (c) => {
  store.deleteProject(c.req.param("id"));
  return c.json({ ok: true });
});
