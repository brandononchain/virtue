import type {
  VirtueCharacter,
  VirtueEnvironment,
  VirtueProp,
  VirtueScene,
  VirtueProject,
  SceneContext,
} from "@virtue/types";

/**
 * Resolved continuity context for a scene — all entities fully hydrated.
 */
export interface ResolvedContinuityContext {
  environment: VirtueEnvironment | undefined;
  characters: VirtueCharacter[];
  props: VirtueProp[];
  lightingIntent: string;
  moodIntent: string;
}

/**
 * Resolve scene context by looking up entity IDs against the project.
 */
export function resolveContinuityContext(
  scene: VirtueScene,
  project: VirtueProject,
): ResolvedContinuityContext {
  const ctx: SceneContext = scene.context ?? {
    activeCharacterIds: scene.characters ?? [],
    activePropIds: [],
    lightingIntent: "",
    moodIntent: scene.mood ?? "",
  };

  const environment = ctx.environmentId
    ? project.environments?.find((e) => e.id === ctx.environmentId)
    : undefined;

  const characters = (ctx.activeCharacterIds ?? [])
    .map((id) => project.characters?.find((c) => c.id === id))
    .filter((c): c is VirtueCharacter => c !== undefined);

  const props = (ctx.activePropIds ?? [])
    .map((id) => project.props?.find((p) => p.id === id))
    .filter((p): p is VirtueProp => p !== undefined);

  return {
    environment,
    characters,
    props,
    lightingIntent: ctx.lightingIntent ?? "",
    moodIntent: ctx.moodIntent ?? scene.mood ?? "",
  };
}
