// Types
export type {
  TemplateCategory,
  TemplateShotDef,
  TemplateSceneDef,
  CinematicTemplate,
  AgentType,
  AgentDef,
  AgentRunInput,
  AgentRunOutput,
} from "./types.js";

// Registry — template queries
export {
  allTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByDifficulty,
  searchTemplates,
  getTemplateCount,
  getCategories,
  getAllTags,
} from "./registry.js";

// Agents
export {
  agents,
  getAgentById,
  getAgentsByType,
  runAgent,
} from "./agents.js";
