import type {
  VirtueScene,
  VirtueProject,
  VirtueWorldState,
  VirtueCharacterState,
  VirtueEnvironmentState,
  VirtuePropState,
} from "@virtue/types";
import {
  getWorldState,
  createWorld,
  updateCharacterState,
  updateEnvironmentState,
  updatePropState,
  addStoryEvent,
  advanceTimeline,
} from "./world-store.js";

// Keyword maps for inferring state changes from shot descriptions
const INJURY_KEYWORDS = ["injured", "wounded", "hurt", "bleeding", "shot", "stabbed", "broken", "collapsed"];
const EMOTION_KEYWORDS: Record<string, string> = {
  angry: "angry", furious: "angry", rage: "angry",
  sad: "sad", crying: "sad", tears: "sad", grief: "sad",
  happy: "happy", smiling: "happy", laughing: "happy", joyful: "happy",
  afraid: "afraid", scared: "afraid", terrified: "afraid", fearful: "afraid",
  shocked: "shocked", surprised: "shocked", stunned: "shocked",
  calm: "calm", serene: "calm", peaceful: "calm",
  determined: "determined", focused: "determined", resolute: "determined",
};
const DAMAGE_KEYWORDS = ["explosion", "destroyed", "burned", "ruined", "collapsed", "shattered", "damaged"];
const WEATHER_KEYWORDS: Record<string, string> = {
  rain: "rainy", raining: "rainy", storm: "stormy", stormy: "stormy",
  snow: "snowy", snowing: "snowy", fog: "foggy", foggy: "foggy",
  sunny: "sunny", clear: "clear",
};
const TIME_KEYWORDS: Record<string, string> = {
  dawn: "dawn", sunrise: "dawn",
  morning: "morning",
  noon: "noon", midday: "noon",
  afternoon: "afternoon",
  dusk: "dusk", sunset: "dusk", "golden hour": "dusk",
  evening: "evening", twilight: "evening",
  night: "night", midnight: "night", "dark": "night",
};

/**
 * Simulate the impact of a scene on the world state.
 * Analyzes shot descriptions and context to infer state changes.
 */
export function simulateSceneImpact(
  project: VirtueProject,
  scene: VirtueScene,
): VirtueWorldState {
  let world = getWorldState(project.id);

  // Initialize world if it doesn't exist
  if (!world) {
    world = initializeWorldFromProject(project);
  }

  const allText = scene.shots
    .map((s) => `${s.description} ${s.prompt}`)
    .join(" ")
    .toLowerCase();

  // Process character state changes
  const activeChars = scene.context?.activeCharacterIds || [];
  for (const charId of activeChars) {
    const charDef = project.characters?.find((c) => c.id === charId);
    const charName = charDef?.name?.toLowerCase() || "";
    const updates: Partial<VirtueCharacterState> = {};

    // Location updates
    if (scene.location) {
      updates.location = scene.location;
    }

    // Emotional state from keywords
    for (const [keyword, emotion] of Object.entries(EMOTION_KEYWORDS)) {
      if (allText.includes(keyword) && (allText.includes(charName) || activeChars.length === 1)) {
        updates.emotionalState = emotion;
        break;
      }
    }

    // Physical condition from keywords
    for (const keyword of INJURY_KEYWORDS) {
      if (allText.includes(keyword) && (allText.includes(charName) || activeChars.length === 1)) {
        updates.physicalCondition = "injured";
        break;
      }
    }

    if (Object.keys(updates).length > 0) {
      updateCharacterState(project.id, charId, updates);
    }
  }

  // Process environment state changes
  const envId = scene.context?.environmentId;
  if (envId) {
    const envUpdates: Partial<VirtueEnvironmentState> = {};

    // Damage detection
    for (const keyword of DAMAGE_KEYWORDS) {
      if (allText.includes(keyword)) {
        envUpdates.damageState = "damaged";
        break;
      }
    }

    // Weather detection
    for (const [keyword, weather] of Object.entries(WEATHER_KEYWORDS)) {
      if (allText.includes(keyword)) {
        envUpdates.weather = weather;
        break;
      }
    }

    // Time of day detection
    for (const [keyword, time] of Object.entries(TIME_KEYWORDS)) {
      if (allText.includes(keyword)) {
        envUpdates.timeOfDay = time;
        break;
      }
    }

    // Track occupancy
    envUpdates.occupancy = activeChars;

    if (Object.keys(envUpdates).length > 0) {
      updateEnvironmentState(project.id, envId, envUpdates);
    }
  }

  // Process prop state changes
  const activeProps = scene.context?.activePropIds || [];
  for (const propId of activeProps) {
    const propDef = project.props?.find((p) => p.id === propId);
    const propName = propDef?.name?.toLowerCase() || "";
    const updates: Partial<VirtuePropState> = {};

    if (scene.location) {
      updates.location = scene.location;
    }

    // Check for destruction
    if (allText.includes(propName) || activeProps.length === 1) {
      for (const keyword of DAMAGE_KEYWORDS) {
        if (allText.includes(keyword)) {
          updates.condition = "damaged";
          break;
        }
      }
      if (allText.includes("dropped") || allText.includes("falls") || allText.includes("discarded")) {
        updates.owner = undefined;
        updates.location = scene.location || "ground";
      }
    }

    if (Object.keys(updates).length > 0) {
      updatePropState(project.id, propId, updates);
    }
  }

  // Record story event
  const eventDescription = buildEventDescription(scene, allText);
  if (eventDescription) {
    addStoryEvent(project.id, {
      sceneId: scene.id,
      description: eventDescription,
      affectedCharacters: activeChars,
      affectedEnvironments: envId ? [envId] : [],
      affectedProps: activeProps,
    });
  }

  // Advance timeline
  advanceTimeline(project.id);

  return getWorldState(project.id)!;
}

/**
 * Initialize world state from project's continuity data.
 */
export function initializeWorldFromProject(project: VirtueProject): VirtueWorldState {
  const characters: VirtueCharacterState[] = (project.characters || []).map((c) => ({
    characterId: c.id,
    location: "unknown",
    emotionalState: "neutral",
    physicalCondition: "normal",
    possessions: [],
    relationships: {},
  }));

  const environments: VirtueEnvironmentState[] = (project.environments || []).map((e) => ({
    environmentId: e.id,
    timeOfDay: e.timeOfDay || "day",
    weather: e.weather || "clear",
    damageState: "intact",
    lightingState: e.lightingStyle || "natural",
    occupancy: [],
  }));

  const props: VirtuePropState[] = (project.props || []).map((p) => ({
    propId: p.id,
    location: "unknown",
    condition: p.condition || "intact",
    visibility: "visible" as const,
  }));

  return createWorld(project.id, characters, environments, props);
}

function buildEventDescription(scene: VirtueScene, allText: string): string {
  const parts: string[] = [];

  if (scene.title) parts.push(scene.title);

  // Detect notable events
  for (const keyword of INJURY_KEYWORDS) {
    if (allText.includes(keyword)) {
      parts.push("injury occurs");
      break;
    }
  }
  for (const keyword of DAMAGE_KEYWORDS) {
    if (allText.includes(keyword)) {
      parts.push("environment damage");
      break;
    }
  }

  return parts.length > 0 ? parts.join(" — ") : `Scene: ${scene.title || scene.id}`;
}
