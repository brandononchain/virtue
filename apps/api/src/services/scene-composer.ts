import type { SceneRenderJob, SceneTimeline } from "@virtue/types";
import { createId, nowISO } from "@virtue/validation";
import {
  buildSceneRenderPlan,
  isTimelineReady,
} from "@virtue/timeline-engine";
import { MockComposer } from "@virtue/media-utils";
import { store } from "./store.js";

const composer = new MockComposer();

// Track in-flight composition jobs
const activeJobs = new Map<string, string>(); // sceneRenderJobId → composerJobId

/**
 * Submit a scene composition job.
 * Validates that all shots have rendered assets, then starts mock composition.
 */
export async function submitSceneComposition(
  projectId: string,
  sceneId: string,
  timeline: SceneTimeline,
): Promise<SceneRenderJob> {
  if (!isTimelineReady(timeline)) {
    throw new Error("Not all shots in the timeline have rendered assets");
  }

  const plan = buildSceneRenderPlan(timeline);
  const now = nowISO();

  const job: SceneRenderJob = {
    id: createId(),
    projectId,
    sceneId,
    timelineId: timeline.id,
    status: "queued",
    progress: 0,
    shotCount: plan.segments.length,
    createdAt: now,
    updatedAt: now,
  };

  store.saveSceneRenderJob(job);

  // Start mock composition
  const inputPaths = plan.segments.map((s) => s.assetId);
  const { jobId: composerJobId } = await composer.compose(inputPaths, {
    outputDir: "/tmp/virtue-scenes",
    outputFilename: `scene-${sceneId}.mp4`,
  });

  activeJobs.set(job.id, composerJobId);

  return job;
}

/**
 * Poll/advance a scene composition job.
 */
export async function pollSceneComposition(
  jobId: string,
): Promise<SceneRenderJob | undefined> {
  const job = store.getSceneRenderJob(jobId);
  if (!job) return undefined;
  if (job.status === "completed" || job.status === "failed") return job;

  const composerJobId = activeJobs.get(jobId);
  if (!composerJobId) {
    // No active composer — mark failed
    const failed: SceneRenderJob = {
      ...job,
      status: "failed",
      error: "Composition job lost — please retry",
      updatedAt: nowISO(),
    };
    store.saveSceneRenderJob(failed);
    return failed;
  }

  const timeline = store.getSceneTimeline(job.timelineId);
  if (!timeline) {
    const failed: SceneRenderJob = {
      ...job,
      status: "failed",
      error: "Timeline not found",
      updatedAt: nowISO(),
    };
    store.saveSceneRenderJob(failed);
    return failed;
  }

  const plan = buildSceneRenderPlan(timeline);
  const inputPaths = plan.segments.map((s) => s.assetId);

  try {
    const result = await composer.advance(composerJobId, inputPaths, {
      outputDir: "/tmp/virtue-scenes",
      outputFilename: `scene-${job.sceneId}.mp4`,
    });

    const statusMap = {
      planning: "planning" as const,
      composing: "composing" as const,
      encoding: "encoding" as const,
      completed: "completed" as const,
    };

    const updated: SceneRenderJob = {
      ...job,
      status: statusMap[result.stage],
      progress: result.progress,
      updatedAt: nowISO(),
    };

    if (result.stage === "completed" && result.result) {
      updated.output = {
        id: createId(),
        projectId: job.projectId,
        type: "video",
        url: `https://mock.virtue.dev/scenes/${job.sceneId}.mp4`,
        filename: result.result.filename,
        metadata: {
          shotCount: job.shotCount,
          totalDuration: result.result.durationSec,
        },
        createdAt: nowISO(),
      };
      activeJobs.delete(jobId);
    }

    store.saveSceneRenderJob(updated);
    return updated;
  } catch (err) {
    const failed: SceneRenderJob = {
      ...job,
      status: "failed",
      error: err instanceof Error ? err.message : "Composition failed",
      updatedAt: nowISO(),
    };
    store.saveSceneRenderJob(failed);
    activeJobs.delete(jobId);
    return failed;
  }
}
