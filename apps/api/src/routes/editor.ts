import { Hono } from "hono";
import { store } from "../services/store.js";
import {
  createEditorTimeline,
  addTransition,
  removeTransition,
  addMusicTrack,
  addVoiceoverTrack,
  addSfxTrack,
  removeAudioTrack,
  updateAudioTrack,
  applyPacingPreset,
  trimShot,
  reorderEditorShots,
} from "@virtue/editor-engine";
import {
  submitSceneExport,
  pollSceneExport,
} from "../services/scene-exporter.js";
import type { VirtueTransition } from "@virtue/types";

export const editorRoutes = new Hono();

/**
 * GET /api/editor/scenes/:projectId/:sceneId
 * Get or auto-create editor timeline for a scene.
 */
editorRoutes.get("/scenes/:projectId/:sceneId", (c) => {
  const { projectId, sceneId } = c.req.param();

  const project = store.getProject(projectId);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const scene = project.scenes.find((s) => s.id === sceneId);
  if (!scene) return c.json({ error: "Scene not found" }, 404);

  // Return existing editor timeline or create one
  let timeline = store.getEditorTimelineBySceneId(sceneId);
  if (!timeline) {
    const renderJobs = store.listRenderJobs(projectId);
    timeline = createEditorTimeline(projectId, scene, renderJobs);
    store.saveEditorTimeline(timeline);
  }

  return c.json(timeline);
});

/**
 * POST /api/editor/scenes/:projectId/:sceneId
 * Create or refresh editor timeline from current scene state.
 */
editorRoutes.post("/scenes/:projectId/:sceneId", (c) => {
  const { projectId, sceneId } = c.req.param();

  const project = store.getProject(projectId);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const scene = project.scenes.find((s) => s.id === sceneId);
  if (!scene) return c.json({ error: "Scene not found" }, 404);

  const renderJobs = store.listRenderJobs(projectId);
  const timeline = createEditorTimeline(projectId, scene, renderJobs);
  store.saveEditorTimeline(timeline);

  return c.json(timeline, 201);
});

/**
 * PUT /api/editor/scenes/:projectId/:sceneId
 * Save the full editor timeline (used by the UI to persist state).
 */
editorRoutes.put("/scenes/:projectId/:sceneId", async (c) => {
  const { sceneId } = c.req.param();
  const body = await c.req.json();

  const existing = store.getEditorTimelineBySceneId(sceneId);
  if (!existing) return c.json({ error: "Editor timeline not found" }, 404);

  const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
  store.saveEditorTimeline(updated);

  return c.json(updated);
});

/**
 * POST /api/editor/scenes/:projectId/:sceneId/transition
 * Add or update a transition between shots.
 */
editorRoutes.post("/scenes/:projectId/:sceneId/transition", async (c) => {
  const { sceneId } = c.req.param();
  const { shotId, transition } = await c.req.json<{
    shotId: string;
    transition: VirtueTransition;
  }>();

  const timeline = store.getEditorTimelineBySceneId(sceneId);
  if (!timeline) return c.json({ error: "Editor timeline not found" }, 404);

  const updated = addTransition(timeline, shotId, transition);
  store.saveEditorTimeline(updated);

  return c.json(updated);
});

/**
 * DELETE /api/editor/scenes/:projectId/:sceneId/transition/:shotId
 * Remove transition from a shot (revert to cut).
 */
editorRoutes.delete("/scenes/:projectId/:sceneId/transition/:shotId", (c) => {
  const { sceneId, shotId } = c.req.param();

  const timeline = store.getEditorTimelineBySceneId(sceneId);
  if (!timeline) return c.json({ error: "Editor timeline not found" }, 404);

  const updated = removeTransition(timeline, shotId);
  store.saveEditorTimeline(updated);

  return c.json(updated);
});

/**
 * POST /api/editor/scenes/:projectId/:sceneId/audio
 * Add an audio track (music, voiceover, or sfx).
 */
editorRoutes.post("/scenes/:projectId/:sceneId/audio", async (c) => {
  const { sceneId } = c.req.param();
  const { type, assetId, startTime, endTime, label, volume, fadeInSec, fadeOutSec } =
    await c.req.json<{
      type: "music" | "voiceover" | "sfx";
      assetId: string;
      startTime: number;
      endTime?: number;
      label?: string;
      volume?: number;
      fadeInSec?: number;
      fadeOutSec?: number;
    }>();

  const timeline = store.getEditorTimelineBySceneId(sceneId);
  if (!timeline) return c.json({ error: "Editor timeline not found" }, 404);

  const opts = { label, volume, fadeInSec, fadeOutSec };
  let updated;
  if (type === "music") {
    updated = addMusicTrack(timeline, assetId, startTime, endTime, opts);
  } else if (type === "voiceover") {
    updated = addVoiceoverTrack(timeline, assetId, startTime, opts);
  } else {
    updated = addSfxTrack(timeline, assetId, startTime, opts);
  }

  store.saveEditorTimeline(updated);
  return c.json(updated, 201);
});

/**
 * DELETE /api/editor/scenes/:projectId/:sceneId/audio/:trackId
 * Remove an audio track.
 */
editorRoutes.delete("/scenes/:projectId/:sceneId/audio/:trackId", (c) => {
  const { sceneId, trackId } = c.req.param();

  const timeline = store.getEditorTimelineBySceneId(sceneId);
  if (!timeline) return c.json({ error: "Editor timeline not found" }, 404);

  const updated = removeAudioTrack(timeline, trackId);
  store.saveEditorTimeline(updated);

  return c.json(updated);
});

/**
 * PUT /api/editor/scenes/:projectId/:sceneId/audio/:trackId
 * Update an audio track's properties.
 */
editorRoutes.put("/scenes/:projectId/:sceneId/audio/:trackId", async (c) => {
  const { sceneId, trackId } = c.req.param();
  const updates = await c.req.json();

  const timeline = store.getEditorTimelineBySceneId(sceneId);
  if (!timeline) return c.json({ error: "Editor timeline not found" }, 404);

  const updated = updateAudioTrack(timeline, trackId, updates);
  store.saveEditorTimeline(updated);

  return c.json(updated);
});

/**
 * POST /api/editor/scenes/:projectId/:sceneId/pacing
 * Apply a pacing preset.
 */
editorRoutes.post("/scenes/:projectId/:sceneId/pacing", async (c) => {
  const { sceneId } = c.req.param();
  const { preset } = await c.req.json<{
    preset: "cinematic" | "slow-burn" | "fast-cut" | "trailer";
  }>();

  const timeline = store.getEditorTimelineBySceneId(sceneId);
  if (!timeline) return c.json({ error: "Editor timeline not found" }, 404);

  const updated = applyPacingPreset(timeline, preset);
  store.saveEditorTimeline(updated);

  return c.json(updated);
});

/**
 * POST /api/editor/scenes/:projectId/:sceneId/reorder
 * Reorder shots in the editor timeline.
 */
editorRoutes.post("/scenes/:projectId/:sceneId/reorder", async (c) => {
  const { sceneId } = c.req.param();
  const { order } = await c.req.json<{ order: string[] }>();

  const timeline = store.getEditorTimelineBySceneId(sceneId);
  if (!timeline) return c.json({ error: "Editor timeline not found" }, 404);

  const updated = reorderEditorShots(timeline, order);
  store.saveEditorTimeline(updated);

  return c.json(updated);
});

/**
 * POST /api/editor/scenes/:projectId/:sceneId/trim
 * Trim a shot's duration.
 */
editorRoutes.post("/scenes/:projectId/:sceneId/trim", async (c) => {
  const { sceneId } = c.req.param();
  const { shotId, trimStart, trimEnd } = await c.req.json<{
    shotId: string;
    trimStart: number;
    trimEnd: number;
  }>();

  const timeline = store.getEditorTimelineBySceneId(sceneId);
  if (!timeline) return c.json({ error: "Editor timeline not found" }, 404);

  const updated = trimShot(timeline, shotId, trimStart, trimEnd);
  store.saveEditorTimeline(updated);

  return c.json(updated);
});

/**
 * POST /api/editor/scenes/:projectId/:sceneId/export
 * Trigger a final scene export with transitions and audio.
 */
editorRoutes.post("/scenes/:projectId/:sceneId/export", async (c) => {
  const { projectId, sceneId } = c.req.param();

  const timeline = store.getEditorTimelineBySceneId(sceneId);
  if (!timeline) return c.json({ error: "Editor timeline not found" }, 404);

  try {
    const job = await submitSceneExport(projectId, sceneId, timeline);
    return c.json(job, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    return c.json({ error: message }, 500);
  }
});

/**
 * GET /api/editor/exports
 * List all export jobs.
 */
editorRoutes.get("/exports", (c) => {
  const projectId = c.req.query("projectId");
  return c.json(store.listExportJobs(projectId));
});

/**
 * GET /api/editor/exports/:id
 * Get export job by ID.
 */
editorRoutes.get("/exports/:id", (c) => {
  const job = store.getExportJob(c.req.param("id"));
  if (!job) return c.json({ error: "Export job not found" }, 404);
  return c.json(job);
});

/**
 * POST /api/editor/exports/:id/poll
 * Poll/advance an export job.
 */
editorRoutes.post("/exports/:id/poll", async (c) => {
  const job = await pollSceneExport(c.req.param("id"));
  if (!job) return c.json({ error: "Export job not found" }, 404);
  return c.json(job);
});
