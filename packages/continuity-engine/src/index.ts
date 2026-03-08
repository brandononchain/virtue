export {
  resolveContinuityContext,
  type ResolvedContinuityContext,
} from "./context.js";

export {
  applyContinuityToPrompt,
  stripContinuityFromPrompt,
  type EnrichmentResult,
} from "./prompt-enrichment.js";

export {
  registerCharacter,
  updateCharacter,
  removeCharacter,
  registerEnvironment,
  updateEnvironment,
  removeEnvironment,
  registerProp,
  updateProp,
  removeProp,
} from "./registry.js";

export {
  setSceneEnvironment,
  setSceneCharacters,
  setSceneProps,
  setSceneLighting,
  setSceneMood,
  setSceneContext,
} from "./scene-context.js";
