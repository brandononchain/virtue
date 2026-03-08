import { execFile } from "node:child_process";
import { writeFile, unlink, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { createId } from "@virtue/validation";

const execFileAsync = promisify(execFile);

export interface AudioTrackInput {
  path: string;
  startTime: number;
  endTime?: number;
  volume: number;
  fadeInSec: number;
  fadeOutSec: number;
}

export interface MixResult {
  outputPath: string;
  filename: string;
  durationSec: number;
}

/**
 * Build ffmpeg filter graph for mixing multiple audio tracks.
 * Each track can have independent volume, start offset, and fade in/out.
 */
export function buildAudioMixFilter(
  tracks: AudioTrackInput[],
  totalDuration: number,
): { inputs: string[]; filterComplex: string } {
  const inputs = tracks.map((t) => t.path);
  const filterParts: string[] = [];
  const streamLabels: string[] = [];

  tracks.forEach((track, i) => {
    const label = `a${i}`;
    const parts: string[] = [];

    // Volume adjustment
    if (track.volume !== 1) {
      parts.push(`volume=${track.volume}`);
    }

    // Fade in
    if (track.fadeInSec > 0) {
      parts.push(`afade=t=in:st=0:d=${track.fadeInSec}`);
    }

    // Fade out - calculate start time for fade
    if (track.fadeOutSec > 0) {
      const fadeStart = (track.endTime || totalDuration) - track.fadeOutSec - track.startTime;
      if (fadeStart > 0) {
        parts.push(`afade=t=out:st=${fadeStart}:d=${track.fadeOutSec}`);
      }
    }

    // Trim if end time specified
    if (track.endTime !== undefined) {
      const duration = track.endTime - track.startTime;
      parts.push(`atrim=0:${duration}`);
    }

    // Delay to start time
    if (track.startTime > 0) {
      const delayMs = Math.round(track.startTime * 1000);
      parts.push(`adelay=${delayMs}|${delayMs}`);
    }

    const filterChain = parts.length > 0
      ? `[${i}:a]${parts.join(",")}[${label}]`
      : `[${i}:a]acopy[${label}]`;

    filterParts.push(filterChain);
    streamLabels.push(`[${label}]`);
  });

  // Mix all streams together
  const mixFilter = `${streamLabels.join("")}amix=inputs=${tracks.length}:duration=longest:normalize=0[aout]`;
  filterParts.push(mixFilter);

  return {
    inputs,
    filterComplex: filterParts.join(";"),
  };
}

/**
 * Mix multiple audio tracks into a single output file.
 */
export async function mixAudioTracks(
  tracks: AudioTrackInput[],
  outputDir: string,
  totalDuration: number,
): Promise<MixResult> {
  if (tracks.length === 0) {
    throw new Error("No audio tracks to mix");
  }

  await mkdir(outputDir, { recursive: true });

  const filename = `mix-${createId()}.aac`;
  const outputPath = join(outputDir, filename);

  if (tracks.length === 1) {
    // Single track — just apply effects
    const track = tracks[0];
    const args: string[] = ["-i", track.path];
    const filters: string[] = [];

    if (track.volume !== 1) filters.push(`volume=${track.volume}`);
    if (track.fadeInSec > 0) filters.push(`afade=t=in:st=0:d=${track.fadeInSec}`);
    if (track.fadeOutSec > 0) {
      const dur = (track.endTime || totalDuration) - track.startTime;
      const fadeStart = dur - track.fadeOutSec;
      if (fadeStart > 0) filters.push(`afade=t=out:st=${fadeStart}:d=${track.fadeOutSec}`);
    }

    if (filters.length > 0) {
      args.push("-af", filters.join(","));
    }
    args.push("-c:a", "aac", "-b:a", "192k", "-y", outputPath);

    await execFileAsync("ffmpeg", args, { timeout: 60_000 });
    return { outputPath, filename, durationSec: totalDuration };
  }

  // Multi-track mix
  const { inputs, filterComplex } = buildAudioMixFilter(tracks, totalDuration);
  const args: string[] = [];
  for (const input of inputs) {
    args.push("-i", input);
  }
  args.push(
    "-filter_complex", filterComplex,
    "-map", "[aout]",
    "-c:a", "aac",
    "-b:a", "192k",
    "-y",
    outputPath,
  );

  await execFileAsync("ffmpeg", args, { timeout: 120_000 });
  return { outputPath, filename, durationSec: totalDuration };
}

/**
 * Combine a composed scene video with a mixed audio track.
 */
export async function composeSceneVideoWithAudio(
  videoPath: string,
  audioPath: string,
  outputDir: string,
): Promise<MixResult> {
  await mkdir(outputDir, { recursive: true });

  const filename = `export-${createId()}.mp4`;
  const outputPath = join(outputDir, filename);

  const args = [
    "-i", videoPath,
    "-i", audioPath,
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "192k",
    "-map", "0:v:0",
    "-map", "1:a:0",
    "-shortest",
    "-movflags", "+faststart",
    "-y",
    outputPath,
  ];

  await execFileAsync("ffmpeg", args, { timeout: 120_000 });
  return { outputPath, filename, durationSec: 0 };
}
