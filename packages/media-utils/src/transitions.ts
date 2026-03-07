import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { createId } from "@virtue/validation";
import type { VirtueTransition } from "@virtue/types";

const execFileAsync = promisify(execFile);

export interface TransitionSegment {
  assetPath: string;
  duration: number;
  transition: VirtueTransition;
}

export interface TransitionComposeResult {
  outputPath: string;
  filename: string;
  durationSec: number;
}

/**
 * Build an ffmpeg filter graph for composing video segments with transitions.
 * Supports: cut (simple concat), fade (to/from black), cross-dissolve (xfade).
 */
export function buildTransitionFilterGraph(
  segments: TransitionSegment[],
): { inputs: string[]; filterComplex: string; needsFilterGraph: boolean } {
  const inputs = segments.map((s) => s.assetPath);

  // Check if any real transitions exist
  const hasTransitions = segments.some(
    (s, i) => i > 0 && s.transition.type !== "cut" && s.transition.durationSec > 0,
  );

  if (!hasTransitions) {
    return { inputs, filterComplex: "", needsFilterGraph: false };
  }

  const parts: string[] = [];
  let prevLabel = "0:v";

  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    const { type, durationSec } = seg.transition;
    const outLabel = i === segments.length - 1 ? "vout" : `v${i}`;

    if (type === "cross-dissolve" && durationSec > 0) {
      const offset = segments[i - 1].duration - durationSec;
      parts.push(
        `[${prevLabel}][${i}:v]xfade=transition=fade:duration=${durationSec}:offset=${Math.max(0, offset)}[${outLabel}]`,
      );
    } else if (type === "fade" && durationSec > 0) {
      const offset = segments[i - 1].duration - durationSec;
      parts.push(
        `[${prevLabel}][${i}:v]xfade=transition=fadeblack:duration=${durationSec}:offset=${Math.max(0, offset)}[${outLabel}]`,
      );
    } else {
      // Cut — simple concat via xfade with 0 duration or just pass through
      const offset = segments[i - 1].duration;
      parts.push(
        `[${prevLabel}][${i}:v]xfade=transition=fade:duration=0.01:offset=${offset}[${outLabel}]`,
      );
    }

    prevLabel = outLabel;
  }

  return {
    inputs,
    filterComplex: parts.join(";"),
    needsFilterGraph: true,
  };
}

/**
 * Compose video segments with transitions applied.
 * Falls back to simple concat if no transitions are needed.
 */
export async function applyTransitionFilters(
  segments: TransitionSegment[],
  outputDir: string,
): Promise<TransitionComposeResult> {
  if (segments.length === 0) {
    throw new Error("No segments to compose");
  }

  await mkdir(outputDir, { recursive: true });

  const filename = `composed-${createId()}.mp4`;
  const outputPath = join(outputDir, filename);

  const { inputs, filterComplex, needsFilterGraph } = buildTransitionFilterGraph(segments);

  if (!needsFilterGraph) {
    // No transitions — use simple concat demuxer approach
    // Return null to signal caller should use concat instead
    throw new Error("NO_TRANSITIONS");
  }

  const args: string[] = [];
  for (const input of inputs) {
    args.push("-i", input);
  }
  args.push(
    "-filter_complex", filterComplex,
    "-map", "[vout]",
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "23",
    "-movflags", "+faststart",
    "-y",
    outputPath,
  );

  await execFileAsync("ffmpeg", args, { timeout: 180_000 });

  const totalDuration = segments.reduce((sum, s, i) => {
    const overlap = i > 0 ? s.transition.durationSec : 0;
    return sum + s.duration - overlap;
  }, 0);

  return { outputPath, filename, durationSec: totalDuration };
}
