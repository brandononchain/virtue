import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { createId } from "@virtue/validation";

/**
 * Mock exporter that simulates the full export pipeline without ffmpeg.
 * Progresses through stages: planning → composing_video → mixing_audio → encoding → completed.
 */
export class MockExporter {
  private stageCallCount = new Map<string, number>();

  async start(sceneId: string): Promise<{ jobId: string }> {
    const jobId = createId();
    this.stageCallCount.set(jobId, 0);
    return { jobId };
  }

  async advance(
    jobId: string,
    sceneId: string,
    outputDir: string,
  ): Promise<{
    stage: "planning" | "composing_video" | "mixing_audio" | "encoding" | "completed";
    progress: number;
    result?: { outputPath: string; filename: string; durationSec: number };
  }> {
    const count = (this.stageCallCount.get(jobId) || 0) + 1;
    this.stageCallCount.set(jobId, count);

    if (count === 1) return { stage: "planning", progress: 10 };
    if (count === 2) return { stage: "composing_video", progress: 30 };
    if (count === 3) return { stage: "mixing_audio", progress: 60 };
    if (count === 4) return { stage: "encoding", progress: 85 };

    // Completed
    const filename = `export-${sceneId}.mp4`;
    const outputPath = join(outputDir, filename);

    await mkdir(outputDir, { recursive: true });
    await writeFile(
      outputPath,
      `[mock export: scene ${sceneId} with transitions and audio]`,
      "utf-8",
    );

    this.stageCallCount.delete(jobId);

    return {
      stage: "completed",
      progress: 100,
      result: { outputPath, filename, durationSec: 30 },
    };
  }
}
