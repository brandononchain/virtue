export type TemplateCategory =
  | "film"
  | "commercial"
  | "gaming"
  | "social"
  | "environment"
  | "characters"
  | "corporate";

export interface TemplateShotDef {
  shotType: string;
  description: string;
  prompt: string;
  cameraMove: string;
  lens: string;
  lighting: string;
  durationSec: number;
  skills: string[];
}

export interface TemplateSceneDef {
  title: string;
  description: string;
  location: string;
  timeOfDay: string;
  mood: string;
  shots: TemplateShotDef[];
}

export interface CinematicTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  tags: string[];
  estimatedDuration: number;
  scenes: TemplateSceneDef[];
  recommendedSkills: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

export type AgentType =
  | "film-director"
  | "commercial-director"
  | "social-video"
  | "game-cinematic"
  | "product-commercial";

export interface AgentDef {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  capabilities: string[];
  defaultTemplateIds: string[];
  style: string;
}

export interface AgentRunInput {
  agentId: string;
  templateId?: string;
  projectName?: string;
  customPrompt?: string;
  parameters?: Record<string, string>;
}

export interface AgentRunOutput {
  projectName: string;
  scenes: TemplateSceneDef[];
  totalShots: number;
  estimatedDuration: number;
  agentNotes: string;
}
