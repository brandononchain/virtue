import type {
  VirtueScene,
  VirtueProject,
  VirtueSimulationContext,
  VirtueCharacterState,
  VirtueEnvironmentState,
  VirtuePropState,
} from "@virtue/types";
import { getWorldState } from "./world-store.js";

/**
 * Build a simulation context for a scene, pulling relevant world state
 * for characters, environments, and props active in the scene.
 */
export function getSimulationContext(
  project: VirtueProject,
  scene: VirtueScene,
): VirtueSimulationContext {
  const world = getWorldState(project.id);

  if (!world) {
    return {
      sceneId: scene.id,
      characterStates: [],
      propStates: [],
      activeConditions: [],
      narrativeSummary: "No world state initialized yet.",
    };
  }

  // Gather character states for active characters in this scene
  const activeCharIds = scene.context?.activeCharacterIds || [];
  const characterStates: VirtueCharacterState[] = activeCharIds
    .map((id) => world.characters.find((c) => c.characterId === id))
    .filter(Boolean) as VirtueCharacterState[];

  // Gather environment state
  const envId = scene.context?.environmentId;
  const environmentState: VirtueEnvironmentState | undefined = envId
    ? world.environments.find((e) => e.environmentId === envId)
    : undefined;

  // Gather prop states
  const activePropIds = scene.context?.activePropIds || [];
  const propStates: VirtuePropState[] = activePropIds
    .map((id) => world.props.find((p) => p.propId === id))
    .filter(Boolean) as VirtuePropState[];

  // Build narrative summary
  const narrativeSummary = buildNarrativeSummary(
    project,
    characterStates,
    environmentState,
    propStates,
    world.activeConditions,
    world.storyEvents.length,
  );

  return {
    sceneId: scene.id,
    characterStates,
    environmentState,
    propStates,
    activeConditions: world.activeConditions,
    narrativeSummary,
  };
}

/**
 * Build a prompt-enrichment fragment from simulation context.
 */
export function buildSimulationPromptFragment(ctx: VirtueSimulationContext): string {
  const parts: string[] = [];

  // Character states
  for (const cs of ctx.characterStates) {
    const traits: string[] = [];
    if (cs.physicalCondition !== "normal") traits.push(cs.physicalCondition);
    if (cs.emotionalState !== "neutral") traits.push(`feeling ${cs.emotionalState}`);
    if (traits.length > 0) {
      parts.push(`Character ${cs.characterId} is ${traits.join(", ")}`);
    }
  }

  // Environment state
  if (ctx.environmentState) {
    const env = ctx.environmentState;
    const envTraits: string[] = [];
    if (env.timeOfDay !== "day") envTraits.push(env.timeOfDay);
    if (env.weather !== "clear") envTraits.push(`${env.weather} weather`);
    if (env.damageState !== "intact") envTraits.push(env.damageState);
    if (envTraits.length > 0) {
      parts.push(`Environment: ${envTraits.join(", ")}`);
    }
  }

  // Prop states
  for (const ps of ctx.propStates) {
    if (ps.condition !== "intact" || ps.visibility !== "visible") {
      const traits: string[] = [];
      if (ps.condition !== "intact") traits.push(ps.condition);
      if (ps.visibility !== "visible") traits.push(ps.visibility);
      parts.push(`Prop ${ps.propId}: ${traits.join(", ")}`);
    }
  }

  // Active conditions
  if (ctx.activeConditions.length > 0) {
    parts.push(`Conditions: ${ctx.activeConditions.join(", ")}`);
  }

  return parts.length > 0
    ? `[World State] ${parts.join(". ")}.`
    : "";
}

function buildNarrativeSummary(
  project: VirtueProject,
  characters: VirtueCharacterState[],
  environment: VirtueEnvironmentState | undefined,
  props: VirtuePropState[],
  conditions: string[],
  eventCount: number,
): string {
  const parts: string[] = [];

  // Characters
  const charNames = characters.map((cs) => {
    const def = project.characters?.find((c) => c.id === cs.characterId);
    const name = def?.name || cs.characterId;
    const traits: string[] = [];
    if (cs.physicalCondition !== "normal") traits.push(cs.physicalCondition);
    if (cs.emotionalState !== "neutral") traits.push(cs.emotionalState);
    return traits.length > 0 ? `${name} (${traits.join(", ")})` : name;
  });
  if (charNames.length > 0) {
    parts.push(`Characters: ${charNames.join(", ")}`);
  }

  // Environment
  if (environment) {
    const envDef = project.environments?.find((e) => e.id === environment.environmentId);
    const envName = envDef?.name || environment.environmentId;
    const envTraits: string[] = [environment.timeOfDay];
    if (environment.weather !== "clear") envTraits.push(environment.weather);
    if (environment.damageState !== "intact") envTraits.push(environment.damageState);
    parts.push(`Location: ${envName} (${envTraits.join(", ")})`);
  }

  // Props
  const notableProps = props.filter((p) => p.condition !== "intact" || p.visibility !== "visible");
  if (notableProps.length > 0) {
    const propDescs = notableProps.map((p) => {
      const def = project.props?.find((pr) => pr.id === p.propId);
      return `${def?.name || p.propId}: ${p.condition}`;
    });
    parts.push(`Props: ${propDescs.join(", ")}`);
  }

  if (conditions.length > 0) {
    parts.push(`Active conditions: ${conditions.join(", ")}`);
  }

  parts.push(`Timeline: ${eventCount} events recorded`);

  return parts.join(". ") + ".";
}
