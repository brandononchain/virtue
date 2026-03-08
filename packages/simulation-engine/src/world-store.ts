import type {
  VirtueWorldState,
  VirtueCharacterState,
  VirtueEnvironmentState,
  VirtuePropState,
  VirtueStoryEvent,
} from "@virtue/types";

const worlds = new Map<string, VirtueWorldState>();

/**
 * Create a new world state for a project.
 */
export function createWorld(
  projectId: string,
  characters: VirtueCharacterState[] = [],
  environments: VirtueEnvironmentState[] = [],
  props: VirtuePropState[] = [],
): VirtueWorldState {
  const world: VirtueWorldState = {
    projectId,
    characters,
    environments,
    props,
    storyEvents: [],
    timelinePosition: 0,
    activeConditions: [],
    updatedAt: new Date().toISOString(),
  };
  worlds.set(projectId, world);
  return world;
}

/**
 * Get the current world state for a project.
 */
export function getWorldState(projectId: string): VirtueWorldState | undefined {
  return worlds.get(projectId);
}

/**
 * Save/replace a world state.
 */
export function saveWorldState(world: VirtueWorldState): void {
  worlds.set(world.projectId, { ...world, updatedAt: new Date().toISOString() });
}

/**
 * Update a character's state in the world.
 */
export function updateCharacterState(
  projectId: string,
  characterId: string,
  updates: Partial<VirtueCharacterState>,
): VirtueWorldState | undefined {
  const world = worlds.get(projectId);
  if (!world) return undefined;

  const idx = world.characters.findIndex((c) => c.characterId === characterId);
  if (idx >= 0) {
    world.characters[idx] = { ...world.characters[idx], ...updates };
  } else {
    world.characters.push({ characterId, location: "unknown", emotionalState: "neutral", physicalCondition: "normal", possessions: [], relationships: {}, ...updates });
  }
  world.updatedAt = new Date().toISOString();
  worlds.set(projectId, world);
  return world;
}

/**
 * Update an environment's state in the world.
 */
export function updateEnvironmentState(
  projectId: string,
  environmentId: string,
  updates: Partial<VirtueEnvironmentState>,
): VirtueWorldState | undefined {
  const world = worlds.get(projectId);
  if (!world) return undefined;

  const idx = world.environments.findIndex((e) => e.environmentId === environmentId);
  if (idx >= 0) {
    world.environments[idx] = { ...world.environments[idx], ...updates };
  } else {
    world.environments.push({ environmentId, timeOfDay: "day", weather: "clear", damageState: "intact", lightingState: "natural", occupancy: [], ...updates });
  }
  world.updatedAt = new Date().toISOString();
  worlds.set(projectId, world);
  return world;
}

/**
 * Update a prop's state in the world.
 */
export function updatePropState(
  projectId: string,
  propId: string,
  updates: Partial<VirtuePropState>,
): VirtueWorldState | undefined {
  const world = worlds.get(projectId);
  if (!world) return undefined;

  const idx = world.props.findIndex((p) => p.propId === propId);
  if (idx >= 0) {
    world.props[idx] = { ...world.props[idx], ...updates };
  } else {
    world.props.push({ propId, location: "unknown", condition: "intact", visibility: "visible", ...updates });
  }
  world.updatedAt = new Date().toISOString();
  worlds.set(projectId, world);
  return world;
}

/**
 * Add a story event to the world timeline.
 */
export function addStoryEvent(
  projectId: string,
  event: Omit<VirtueStoryEvent, "id" | "timestamp">,
): VirtueWorldState | undefined {
  const world = worlds.get(projectId);
  if (!world) return undefined;

  world.storyEvents.push({
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  });
  world.updatedAt = new Date().toISOString();
  worlds.set(projectId, world);
  return world;
}

/**
 * Set active conditions on the world.
 */
export function setActiveConditions(
  projectId: string,
  conditions: string[],
): VirtueWorldState | undefined {
  const world = worlds.get(projectId);
  if (!world) return undefined;
  world.activeConditions = conditions;
  world.updatedAt = new Date().toISOString();
  worlds.set(projectId, world);
  return world;
}

/**
 * Advance the timeline position.
 */
export function advanceTimeline(projectId: string): VirtueWorldState | undefined {
  const world = worlds.get(projectId);
  if (!world) return undefined;
  world.timelinePosition += 1;
  world.updatedAt = new Date().toISOString();
  worlds.set(projectId, world);
  return world;
}
