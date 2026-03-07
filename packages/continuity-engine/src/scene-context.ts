import type { VirtueProject, VirtueScene, SceneContext } from "@virtue/types";

/**
 * Assign an environment to a scene.
 */
export function setSceneEnvironment(
  project: VirtueProject,
  sceneId: string,
  environmentId: string,
): VirtueProject {
  return updateSceneContext(project, sceneId, (ctx) => ({
    ...ctx,
    environmentId,
  }));
}

/**
 * Set active characters for a scene.
 */
export function setSceneCharacters(
  project: VirtueProject,
  sceneId: string,
  characterIds: string[],
): VirtueProject {
  return updateSceneContext(project, sceneId, (ctx) => ({
    ...ctx,
    activeCharacterIds: characterIds,
  }));
}

/**
 * Set active props for a scene.
 */
export function setSceneProps(
  project: VirtueProject,
  sceneId: string,
  propIds: string[],
): VirtueProject {
  return updateSceneContext(project, sceneId, (ctx) => ({
    ...ctx,
    activePropIds: propIds,
  }));
}

/**
 * Set lighting intent for a scene.
 */
export function setSceneLighting(
  project: VirtueProject,
  sceneId: string,
  lightingIntent: string,
): VirtueProject {
  return updateSceneContext(project, sceneId, (ctx) => ({
    ...ctx,
    lightingIntent,
  }));
}

/**
 * Set mood intent for a scene.
 */
export function setSceneMood(
  project: VirtueProject,
  sceneId: string,
  moodIntent: string,
): VirtueProject {
  return updateSceneContext(project, sceneId, (ctx) => ({
    ...ctx,
    moodIntent,
  }));
}

/**
 * Update the full scene context at once.
 */
export function setSceneContext(
  project: VirtueProject,
  sceneId: string,
  context: SceneContext,
): VirtueProject {
  return {
    ...project,
    scenes: project.scenes.map((s) =>
      s.id === sceneId ? { ...s, context } : s,
    ),
  };
}

function updateSceneContext(
  project: VirtueProject,
  sceneId: string,
  updater: (ctx: SceneContext) => SceneContext,
): VirtueProject {
  return {
    ...project,
    scenes: project.scenes.map((s) => {
      if (s.id !== sceneId) return s;
      const current: SceneContext = s.context ?? {
        activeCharacterIds: s.characters ?? [],
        activePropIds: [],
        lightingIntent: "",
        moodIntent: s.mood ?? "",
      };
      return { ...s, context: updater(current) };
    }),
  };
}
