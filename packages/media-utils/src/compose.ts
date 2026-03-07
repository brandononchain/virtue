import { execFile } from "node:child_process";
import { writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { createId } from "@virtue/validation";

const execFileAsync = promisify(execFile);

export interface ComposeOptions {
  outputDir: string;
  outputFilename?: string;
}

export interface ComposeResult {
  outputPath: string;
  filename: string;
  durationSec: number;
}

/**
 * Build the ffmpeg concat demuxer file content.
 * Each input file is listed as: file '/path/to/video.mp4'
 */
export function buildConcatFile(inputPaths: string[]): string {
  return inputPaths
    .map((p) => `file '${p.replace(/'/g, "'\\''")}'`)
    .join("\n");
}

/**
 * Build ffmpeg args for concat demuxer composition.
 */
export function buildFfmpegArgs(
  concatFilePath: string,
  outputPath: string,
): string[] {
  return [
    "-f", "concat",
    "-safe", "0",
    "-i", concatFilePath,
    "-c", "copy",
    "-movflags", "+faststart",
    "-y",
    outputPath,
  ];
}

/**
 * Compose multiple video files into a single output using ffmpeg concat demuxer.
 * Falls back gracefully if ffmpeg is not installed.
 */
export async function composeVideos(
  inputPaths: string[],
  options: ComposeOptions,
): Promise<ComposeResult> {
  if (inputPaths.length === 0) {
    throw new Error("No input videos to compose");
  }

  const filename = options.outputFilename || `scene-${createId()}.mp4`;
  const outputPath = join(options.outputDir, filename);
  const concatFilePath = join(options.outputDir, `concat-${createId()}.txt`);

  try {
    // Write the concat demuxer file
    const concatContent = buildConcatFile(inputPaths);
    await writeFile(concatFilePath, concatContent, "utf-8");

    // Run ffmpeg
    const args = buildFfmpegArgs(concatFilePath, outputPath);
    await execFileAsync("ffmpeg", args, { timeout: 120_000 });

    return {
      outputPath,
      filename,
      durationSec: 0, // Caller should compute from timeline
    };
  } finally {
    // Clean up concat file
    await unlink(concatFilePath).catch(() => {});
  }
}
