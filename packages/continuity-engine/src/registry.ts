import type {
  VirtueCharacter,
  VirtueEnvironment,
  VirtueProp,
  VirtueProject,
} from "@virtue/types";
import { createId } from "@virtue/validation";

/**
 * Register a new character against a project (returns updated project).
 */
export function registerCharacter(
  project: VirtueProject,
  data: Omit<VirtueCharacter, "id" | "projectId">,
): { project: VirtueProject; character: VirtueCharacter } {
  const character: VirtueCharacter = {
    id: createId(),
    projectId: project.id,
    ...data,
  };
  const updated: VirtueProject = {
    ...project,
    characters: [...(project.characters ?? []), character],
  };
  return { project: updated, character };
}

/**
 * Update an existing character on a project.
 */
export function updateCharacter(
  project: VirtueProject,
  characterId: string,
  data: Partial<Omit<VirtueCharacter, "id" | "projectId">>,
): VirtueProject {
  return {
    ...project,
    characters: (project.characters ?? []).map((c) =>
      c.id === characterId ? { ...c, ...data } : c,
    ),
  };
}

/**
 * Remove a character from a project.
 */
export function removeCharacter(
  project: VirtueProject,
  characterId: string,
): VirtueProject {
  return {
    ...project,
    characters: (project.characters ?? []).filter((c) => c.id !== characterId),
  };
}

/**
 * Register a new environment against a project.
 */
export function registerEnvironment(
  project: VirtueProject,
  data: Omit<VirtueEnvironment, "id" | "projectId">,
): { project: VirtueProject; environment: VirtueEnvironment } {
  const environment: VirtueEnvironment = {
    id: createId(),
    projectId: project.id,
    ...data,
  };
  const updated: VirtueProject = {
    ...project,
    environments: [...(project.environments ?? []), environment],
  };
  return { project: updated, environment };
}

/**
 * Update an existing environment on a project.
 */
export function updateEnvironment(
  project: VirtueProject,
  environmentId: string,
  data: Partial<Omit<VirtueEnvironment, "id" | "projectId">>,
): VirtueProject {
  return {
    ...project,
    environments: (project.environments ?? []).map((e) =>
      e.id === environmentId ? { ...e, ...data } : e,
    ),
  };
}

/**
 * Remove an environment from a project.
 */
export function removeEnvironment(
  project: VirtueProject,
  environmentId: string,
): VirtueProject {
  return {
    ...project,
    environments: (project.environments ?? []).filter(
      (e) => e.id !== environmentId,
    ),
  };
}

/**
 * Register a new prop against a project.
 */
export function registerProp(
  project: VirtueProject,
  data: Omit<VirtueProp, "id" | "projectId">,
): { project: VirtueProject; prop: VirtueProp } {
  const prop: VirtueProp = {
    id: createId(),
    projectId: project.id,
    ...data,
  };
  const updated: VirtueProject = {
    ...project,
    props: [...(project.props ?? []), prop],
  };
  return { project: updated, prop };
}

/**
 * Update an existing prop on a project.
 */
export function updateProp(
  project: VirtueProject,
  propId: string,
  data: Partial<Omit<VirtueProp, "id" | "projectId">>,
): VirtueProject {
  return {
    ...project,
    props: (project.props ?? []).map((p) =>
      p.id === propId ? { ...p, ...data } : p,
    ),
  };
}

/**
 * Remove a prop from a project.
 */
export function removeProp(
  project: VirtueProject,
  propId: string,
): VirtueProject {
  return {
    ...project,
    props: (project.props ?? []).filter((p) => p.id !== propId),
  };
}
