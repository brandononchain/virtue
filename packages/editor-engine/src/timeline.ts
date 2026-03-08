import type {
  VirtueEditorTimeline,
  EditorTimelineShot,
  VirtueScene,
  VirtueRenderJob,
  SceneTimeline,
} from "@virtue/types";
import { createId, nowISO } from "@virtue/validation";

/**
 * Create a new editor timeline from a scene and its render jobs.
 * Initializes all shots with default cut transitions and no audio tracks.
 */
export function createEditorTimeline(
  projectId: string,
  scene: VirtueScene,
  renderJobs: VirtueRenderJob[],
): VirtueEditorTimeline {
  const completedByShot = new Map<string, VirtueRenderJob>();
  for (const job of renderJobs) {
    if (job.status === "completed" && job.output && job.projectId === projectId) {
      completedByShot.set(job.shotId, job);
    }
  }

  let currentTime = 0;
  const shots: EditorTimelineShot[] = [];

  for (const shot of scene.shots) {
    const job = completedByShot.get(shot.id);
    shots.push({
      shotId: shot.id,
      renderAssetId: job?.output?.id,
      startTime: currentTime,
      duration: shot.durationSec,
      trimStart: 0,
      trimEnd: 0,
      transition: { type: "cut", durationSec: 0 },
    });
    currentTime += shot.durationSec;
  }

  const now = nowISO();
  return {
    id: createId(),
    projectId,
    sceneId: scene.id,
    shots,
    musicTracks: [],
    voiceoverTracks: [],
    sfxTracks: [],
    totalDuration: currentTime,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create an editor timeline from an existing scene timeline.
 * Preserves shot order and render asset references.
 */
export function createEditorTimelineFromSceneTimeline(
  sceneTimeline: SceneTimeline,
): VirtueEditorTimeline {
  const shots: EditorTimelineConnectionShot[] = sceneTimeline.shots.map((s) => ({
    shotId: s.shotId,
    renderAssetId: s.renderAssetId,
    startTime: s.startTime,
    duration: s.duration,
    trimStart: 0,
    trimEnd: 0,
    transition: { type: "cut" as const, durationSec: 0 },
  }));

  const now = nowISO();
  return {
    id: createId(),
    projectId: sceneTimeline.projectId,
    sceneId: sceneTimeline.sceneId,
    shots,
    musicTracks: [],
    voiceoverTracks: [],
    sfxTracks: [],
    totalDuration: sceneTimeline.totalDuration,
    createdAt: now,
    updatedAt: now,
  };
}

type EditorTimelineConnectionShot = EditorTimelineShot;
