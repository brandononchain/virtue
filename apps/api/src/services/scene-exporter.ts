import type { VirtueExportJob, VirtueEditorTimeline } from "@virtue/types";
import { createId, nowISO } from "@virtue/validation";
import { MockExporter } from "@virtue/media-utils";
import { store } from "./store.js";

const exporter = new MockExporter();
const activeExports = new Map<string, string>(); // exportJobId → exporterJobId

/**
 * Submit a scene export job.
 * Validates the editor timeline has renderable shots, then starts the export pipeline.
 */
export async function submitSceneExport(
  projectId: string,
  sceneId: string,
  timeline: VirtueEditorTimeline,
): Promise<VirtueExportJob> {
  const readyShots = timeline.shots.filter((s) => s.renderAssetId);
  if (readyShots.length === 0) {
    throw new Error("No rendered shots in the editor timeline");
  }

  const now = nowISO();
  const job: VirtueExportJob = {
    id: createId(),
    projectId,
    sceneId,
    timelineId: timeline.id,
    status: "queued",
    progress: 0,
    createdAt: now,
    updatedAt: now,
  };

  store.saveExportJob(job);

  const { jobId: exporterJobId } = await exporter.start(sceneId);
  activeExports.set(job.id, exporterJobId);

  return job;
}

/**
 * Poll/advance a scene export job.
 */
export async function pollSceneExport(
  jobId: string,
): Promise<VirtueExportJob | undefined> {
  const job = store.getExportJob(jobId);
  if (!job) return undefined;
  if (job.status === "completed" || job.status === "failed") return job;

  const exporterJobId = activeExports.get(jobId);
  if (!exporterJobId) {
    const failed: VirtueExportJob = {
      ...job,
      status: "failed",
      error: "Export job lost — please retry",
      updatedAt: nowISO(),
    };
    store.saveExportJob(failed);
    return failed;
  }

  try {
    const result = await exporter.advance(
      exporterJobId,
      job.sceneId,
      "/tmp/virtue-exports",
    );

    const updated: VirtueExportJob = {
      ...job,
      status: result.stage,
      progress: result.progress,
      updatedAt: nowISO(),
    };

    if (result.stage === "completed" && result.result) {
      updated.output = {
        id: createId(),
        projectId: job.projectId,
        type: "video",
        url: `https://mock.virtue.dev/exports/${job.sceneId}.mp4`,
        filename: result.result.filename,
        metadata: {
          durationSec: result.result.durationSec,
          exportType: "editor",
        },
        createdAt: nowISO(),
      };
      activeExports.delete(jobId);
    }

    store.saveExportJob(updated);
    return updated;
  } catch (err) {
    const failed: VirtueExportJob = {
      ...job,
      status: "failed",
      error: err instanceof Error ? err.message : "Export failed",
      updatedAt: nowISO(),
    };
    store.saveExportJob(failed);
    activeExports.delete(jobId);
    return failed;
  }
}
