import type {
  SceneTimeline,
  TimelineShot,
  VirtueScene,
  VirtueRenderJob,
} from "@virtue/types";
import { createId, nowISO } from "@virtue/validation";

/**
 * Create a new scene timeline from a scene's shots.
 * Automatically orders shots by their scene order and
 * calculates start times sequentially.
 */
export function createTimeline(
  projectId: string,
  scene: VirtueScene,
  renderJobs: VirtueRenderJob[],
): SceneTimeline {
  const completedByShot = new Map<string, VirtueRenderJob>();
  for (const job of renderJobs) {
    if (
      job.status === "completed" &&
      job.output &&
      job.projectId === projectId
    ) {
      completedByShot.set(job.shotId, job);
    }
  }

  let currentTime = 0;
  const shots: TimelineShot[] = [];

  for (const shot of scene.shots) {
    const job = completedByShot.get(shot.id);
    shots.push({
      shotId: shot.id,
      renderAssetId: job?.output?.id,
      startTime: currentTime,
      duration: shot.durationSec,
      transitionType: "cut",
      transitionDuration: 0,
    });
    currentTime += shot.durationSec;
  }

  const now = nowISO();
  return {
    id: createId(),
    projectId,
    sceneId: scene.id,
    shots,
    totalDuration: currentTime,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Add a shot to an existing timeline at the end.
 */
export function addShotToTimeline(
  timeline: SceneTimeline,
  shotId: string,
  duration: number,
  renderAssetId?: string,
): SceneTimeline {
  const startTime = timeline.totalDuration;
  const newShot: TimelineShot = {
    shotId,
    renderAssetId,
    startTime,
    duration,
    transitionType: "cut",
    transitionDuration: 0,
  };
  const shots = [...timeline.shots, newShot];
  return {
    ...timeline,
    shots,
    totalDuration: startTime + duration,
    updatedAt: nowISO(),
  };
}

/**
 * Reorder shots in a timeline by providing a new array of shot IDs.
 * Recalculates all start times.
 */
export function reorderShots(
  timeline: SceneTimeline,
  newOrder: string[],
): SceneTimeline {
  const shotMap = new Map(timeline.shots.map((s) => [s.shotId, s]));
  let currentTime = 0;
  const reordered: TimelineShot[] = [];

  for (const shotId of newOrder) {
    const shot = shotMap.get(shotId);
    if (!shot) continue;
    reordered.push({
      ...shot,
      startTime: currentTime,
    });
    currentTime += shot.duration;
  }

  return {
    ...timeline,
    shots: reordered,
    totalDuration: currentTime,
    updatedAt: nowISO(),
  };
}

/**
 * Update the render asset for a specific shot in the timeline.
 */
export function updateShotAsset(
  timeline: SceneTimeline,
  shotId: string,
  renderAssetId: string,
): SceneTimeline {
  return {
    ...timeline,
    shots: timeline.shots.map((s) =>
      s.shotId === shotId ? { ...s, renderAssetId } : s,
    ),
    updatedAt: nowISO(),
  };
}

/**
 * Check if all shots in a timeline have rendered assets.
 */
export function isTimelineReady(timeline: SceneTimeline): boolean {
  return (
    timeline.shots.length > 0 &&
    timeline.shots.every((s) => s.renderAssetId !== undefined)
  );
}

/**
 * Build a scene render plan — returns the ordered list of asset URLs
 * and ffmpeg concat instructions.
 */
export interface SceneRenderPlan {
  timelineId: string;
  sceneId: string;
  totalDuration: number;
  segments: Array<{
    shotId: string;
    assetId: string;
    duration: number;
    order: number;
  }>;
}

export function buildSceneRenderPlan(
  timeline: SceneTimeline,
): SceneRenderPlan {
  const segments = timeline.shots
    .filter((s) => s.renderAssetId)
    .map((s, i) => ({
      shotId: s.shotId,
      assetId: s.renderAssetId!,
      duration: s.duration,
      order: i,
    }));

  return {
    timelineId: timeline.id,
    sceneId: timeline.sceneId,
    totalDuration: timeline.totalDuration,
    segments,
  };
}
