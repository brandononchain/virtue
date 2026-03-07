import type { VirtueProject, VirtueScene, VirtueShot, VirtueSkill } from "@virtue/types";
import { createId, nowISO } from "@virtue/validation";
import { matchSkills } from "@virtue/skills-engine";

/**
 * Create a new blank project.
 */
export function createProject(name: string, description = ""): VirtueProject {
  const now = nowISO();
  return {
    id: createId(),
    name,
    description,
    screenplay: "",
    scenes: [],
    characters: [],
    environments: [],
    props: [],
    assets: [],
    provider: "mock",
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Add a scene to a project.
 */
export function addScene(
  project: VirtueProject,
  title: string,
  opts: Partial<Omit<VirtueScene, "id" | "projectId" | "order" | "title">> = {}
): VirtueProject {
  const scene: VirtueScene = {
    id: createId(),
    projectId: project.id,
    order: project.scenes.length,
    title,
    description: opts.description || "",
    location: opts.location || "",
    timeOfDay: opts.timeOfDay || "day",
    mood: opts.mood || "",
    shots: opts.shots || [],
    characters: opts.characters || [],
  };
  return {
    ...project,
    scenes: [...project.scenes, scene],
    updatedAt: nowISO(),
  };
}

/**
 * Add a shot to a scene within a project.
 */
export function addShot(
  project: VirtueProject,
  sceneId: string,
  shot: Omit<VirtueShot, "id" | "sceneId" | "order">
): VirtueProject {
  return {
    ...project,
    scenes: project.scenes.map((scene) => {
      if (scene.id !== sceneId) return scene;
      const newShot: VirtueShot = {
        ...shot,
        id: createId(),
        sceneId,
        order: scene.shots.length,
      };
      return { ...scene, shots: [...scene.shots, newShot] };
    }),
    updatedAt: nowISO(),
  };
}

/**
 * Auto-attach relevant skills to a shot based on its description.
 */
export function attachSkillsToShot(
  project: VirtueProject,
  sceneId: string,
  shotId: string,
  allSkills: VirtueSkill[]
): VirtueProject {
  return {
    ...project,
    scenes: project.scenes.map((scene) => {
      if (scene.id !== sceneId) return scene;
      return {
        ...scene,
        shots: scene.shots.map((shot) => {
          if (shot.id !== shotId) return shot;
          const matched = matchSkills(
            `${shot.description} ${shot.prompt} ${shot.shotType} ${shot.cameraMove} ${shot.lighting}`,
            allSkills
          );
          return { ...shot, skills: matched.map((s) => s.id) };
        }),
      };
    }),
    updatedAt: nowISO(),
  };
}
