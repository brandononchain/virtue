import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { createId } from "@virtue/validation";
import type { ComposeResult, ComposeOptions } from "./compose.js";

/**
 * Mock composer that simulates video composition without ffmpeg.
 * Creates a placeholder file and returns a mock result.
 * Used for development and testing.
 */
export class MockComposer {
  private stageCallCount = new Map<string, number>();

  /**
   * Simulate composing videos. Each call to `advance()` progresses
   * the composition through stages, similar to the mock provider pattern.
   */
  async compose(
    inputPaths: string[],
    options: ComposeOptions,
  ): Promise<{ jobId: string }> {
    const jobId = createId();
    this.stageCallCount.set(jobId, 0);
    return { jobId };
  }

  /**
   * Advance the mock composition by one stage.
   * Returns the current stage and progress.
   */
  async advance(
    jobId: string,
    inputPaths: string[],
    options: ComposeOptions,
  ): Promise<{
    stage: "planning" | "composing" | "encoding" | "completed";
    progress: number;
    result?: ComposeResult;
  }> {
    const count = (this.stageCallCount.get(jobId) || 0) + 1;
    this.stageCallCount.set(jobId, count);

    if (count === 1) {
      return { stage: "planning", progress: 15 };
    }
    if (count === 2) {
      return { stage: "composing", progress: 50 };
    }
    if (count === 3) {
      return { stage: "encoding", progress: 80 };
    }

    // Completed — create a placeholder file
    const filename = options.outputFilename || `scene-${jobId}.mp4`;
    const outputPath = join(options.outputDir, filename);

    await mkdir(options.outputDir, { recursive: true });
    await writeFile(
      outputPath,
      `[mock composed scene: ${inputPaths.length} shots]`,
      "utf-8",
    );

    this.stageCallCount.delete(jobId);

    return {
      stage: "completed",
      progress: 100,
      result: {
        outputPath,
        filename,
        durationSec: inputPaths.length * 4,
      },
    };
  }
}
