import type { VirtueShot, VirtuePromptImprovement } from "@virtue/types";

/**
 * Suggest improvements to a shot's generation prompt.
 */
export function suggestPromptImprovements(
  shot: VirtueShot,
  renderError?: string,
): VirtuePromptImprovement {
  const original = shot.prompt || shot.description;
  const changes: string[] = [];
  let improved = original;

  // Add cinematic quality markers if missing
  if (!improved.toLowerCase().includes("cinematic") && !improved.toLowerCase().includes("film")) {
    improved = `Cinematic ${improved}`;
    changes.push("Added cinematic quality prefix");
  }

  // Add camera/lens info if not present
  if (!improved.toLowerCase().includes("lens") && !improved.toLowerCase().includes("mm")) {
    improved += `, ${shot.lens} lens`;
    changes.push(`Added lens specification (${shot.lens})`);
  }

  // Add lighting info if not present
  if (!improved.toLowerCase().includes("lighting") && !improved.toLowerCase().includes("light")) {
    improved += `, ${shot.lighting} lighting`;
    changes.push(`Added lighting direction (${shot.lighting})`);
  }

  // Add depth of field for close-ups
  if ((shot.shotType === "close" || shot.shotType === "extreme-close") &&
      !improved.toLowerCase().includes("depth of field") &&
      !improved.toLowerCase().includes("bokeh")) {
    improved += ", shallow depth of field";
    changes.push("Added shallow depth of field for close-up");
  }

  // Add motion descriptor for camera moves
  if (shot.cameraMove !== "static" && !improved.toLowerCase().includes(shot.cameraMove.replace("_", " "))) {
    improved += `, ${shot.cameraMove.replace("_", " ")} camera movement`;
    changes.push(`Added camera movement descriptor (${shot.cameraMove})`);
  }

  // If render failed, suggest simplification
  if (renderError) {
    if (renderError.toLowerCase().includes("timeout") || renderError.toLowerCase().includes("duration")) {
      changes.push("Suggested shorter duration or simpler composition due to timeout");
    }
    if (improved.length > 300) {
      improved = improved.slice(0, 280) + "...";
      changes.push("Shortened prompt to reduce complexity");
    }
  }

  // Add photorealistic if shot type demands it
  if ((shot.shotType === "establishing" || shot.shotType === "aerial") &&
      !improved.toLowerCase().includes("photoreal") &&
      !improved.toLowerCase().includes("realistic")) {
    improved += ", photorealistic";
    changes.push("Added photorealistic quality tag for environment shot");
  }

  // Build reason
  let reason = "Enhanced prompt with";
  if (changes.length === 0) {
    reason = "Prompt already well-structured — no improvements needed";
    changes.push("No changes needed");
  } else {
    reason = `Enhanced prompt: ${changes.join(", ")}`;
  }

  return {
    id: `pi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    shotId: shot.id,
    originalPrompt: original,
    improvedPrompt: improved,
    changes,
    reason,
  };
}

/**
 * Suggest retry strategies for a failed or weak render.
 */
export function suggestRetryStrategies(
  shot: VirtueShot,
  renderError?: string,
  currentProvider?: string,
): { improvedPrompt: VirtuePromptImprovement; suggestedProvider?: string; suggestedDuration?: number } {
  const improvement = suggestPromptImprovements(shot, renderError);

  let suggestedProvider: string | undefined;
  let suggestedDuration: number | undefined;

  // Provider switching logic
  if (renderError) {
    if (currentProvider === "openai" || currentProvider === "luma") {
      suggestedProvider = "google"; // Google is fast, good fallback
      improvement.changes.push(`Suggested switching from ${currentProvider} to Google (faster turnaround)`);
    } else if (currentProvider === "mock") {
      suggestedProvider = "luma";
      improvement.changes.push("Suggested switching from mock to Luma for real generation");
    }
  }

  // Duration adjustment
  if (shot.durationSec > 8 && renderError) {
    suggestedDuration = Math.min(shot.durationSec, 6);
    improvement.changes.push(`Suggested reducing duration from ${shot.durationSec}s to ${suggestedDuration}s`);
  }

  return { improvedPrompt: improvement, suggestedProvider, suggestedDuration };
}
