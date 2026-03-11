import type { AgentDef, AgentRunInput, AgentRunOutput, TemplateSceneDef } from "./types.js";
import { getTemplateById } from "./registry.js";

export const agents: AgentDef[] = [
  {
    id: "agent-film-director",
    name: "Film Director",
    type: "film-director",
    description:
      "A seasoned film director agent specializing in narrative-driven cinematic sequences. Crafts emotionally resonant scenes with classic cinematography techniques, dramatic lighting, and purposeful camera movement.",
    capabilities: [
      "narrative-structure",
      "dramatic-pacing",
      "character-cinematography",
      "lighting-design",
      "emotional-arc",
      "genre-conventions",
    ],
    defaultTemplateIds: [
      "film-noir-detective",
      "film-horror-cabin",
      "film-scifi-discovery",
      "film-romance-reunion",
      "film-western-standoff",
      "film-samurai-duel",
      "film-ghost-story",
    ],
    style:
      "Cinematic, narrative-driven, emotionally resonant. Favors dramatic lighting, purposeful camera movement, and classic shot composition. Builds tension through pacing and releases through visual payoffs.",
  },
  {
    id: "agent-commercial-director",
    name: "Commercial Director",
    type: "commercial-director",
    description:
      "A premium commercial director agent specializing in product-focused and brand storytelling. Creates polished, aspirational content with hero lighting, lifestyle integration, and brand-aligned aesthetics.",
    capabilities: [
      "product-hero-shots",
      "brand-storytelling",
      "lifestyle-integration",
      "premium-lighting",
      "desire-creation",
      "call-to-action",
    ],
    defaultTemplateIds: [
      "comm-luxury-car",
      "comm-perfume-luxury",
      "comm-food-burger",
      "comm-tech-phone",
      "comm-sneaker-drop",
      "comm-hotel-luxury",
    ],
    style:
      "Polished, aspirational, product-focused. Uses hero lighting to elevate products, lifestyle context to create desire, and premium production values throughout. Every frame sells.",
  },
  {
    id: "agent-social-video",
    name: "Social Video Creator",
    type: "social-video",
    description:
      "A social media video specialist agent optimized for short-form, high-engagement content. Creates thumb-stopping content with fast pacing, trendy aesthetics, and satisfying visual hooks.",
    capabilities: [
      "short-form-pacing",
      "hook-creation",
      "trend-awareness",
      "satisfying-sequences",
      "platform-optimization",
      "engagement-maximization",
    ],
    defaultTemplateIds: [
      "social-travel-vlog",
      "social-recipe-reel",
      "social-fitness-transformation",
      "social-pet-day",
      "social-morning-routine",
      "social-street-style",
    ],
    style:
      "Fast-paced, visually satisfying, scroll-stopping. Optimized for vertical and square formats. Opens with hooks, delivers satisfying payoffs, and maintains energy throughout. Platform-native aesthetics.",
  },
  {
    id: "agent-game-cinematic",
    name: "Game Cinematic Director",
    type: "game-cinematic",
    description:
      "A game cinematic specialist agent creating epic, immersive game trailers and cutscenes. Excels at world-building, action choreography, and genre-specific visual styles from fantasy to sci-fi.",
    capabilities: [
      "world-building",
      "action-choreography",
      "vfx-integration",
      "genre-mastery",
      "epic-scale",
      "player-immersion",
    ],
    defaultTemplateIds: [
      "game-fantasy-intro",
      "game-fps-combat",
      "game-racing-intro",
      "game-horror-survival",
      "game-space-opera",
      "game-cyberpunk-city",
      "game-mecha-battle",
    ],
    style:
      "Epic, immersive, genre-authentic. Creates cinematic experiences that match AAA game quality. Emphasizes world-building, dramatic reveals, and action choreography. VFX-forward with practical grounding.",
  },
  {
    id: "agent-product-commercial",
    name: "Product Commercial Specialist",
    type: "product-commercial",
    description:
      "A product commercial specialist agent focused on making products the hero. Creates clean, premium product showcases with studio-quality lighting, detail shots, and lifestyle context.",
    capabilities: [
      "product-photography",
      "studio-lighting",
      "detail-showcase",
      "lifestyle-context",
      "brand-consistency",
      "feature-highlighting",
    ],
    defaultTemplateIds: [
      "comm-tech-phone",
      "comm-watch-luxury",
      "comm-jewelry-elegant",
      "comm-coffee-morning",
      "comm-electric-vehicle",
      "social-unboxing-tech",
    ],
    style:
      "Clean, precise, product-centric. Studio-quality lighting that highlights material quality and design details. Smooth camera movements reveal product from every angle. Lifestyle integration shows the product in its natural habitat.",
  },
];

export function getAgentById(id: string): AgentDef | undefined {
  return agents.find((a) => a.id === id);
}

export function getAgentsByType(type: string): AgentDef[] {
  return agents.filter((a) => a.type === type);
}

export function runAgent(input: AgentRunInput): AgentRunOutput {
  const agent = getAgentById(input.agentId);
  if (!agent) {
    throw new Error(`Agent not found: ${input.agentId}`);
  }

  // If a template is specified, use it; otherwise pick the first default
  const templateId =
    input.templateId ?? agent.defaultTemplateIds[0] ?? undefined;

  let scenes: TemplateSceneDef[] = [];
  let estimatedDuration = 0;

  if (templateId) {
    const template = getTemplateById(templateId);
    if (template) {
      scenes = template.scenes;
      estimatedDuration = template.estimatedDuration;
    }
  }

  // Apply custom prompt adjustments (v0.1: append as agent notes)
  const agentNotes = input.customPrompt
    ? `Agent "${agent.name}" applied style: ${agent.style}. Custom direction: ${input.customPrompt}`
    : `Agent "${agent.name}" applied style: ${agent.style}`;

  const totalShots = scenes.reduce((sum, s) => sum + s.shots.length, 0);

  return {
    projectName:
      input.projectName ?? `${agent.name} — Untitled Project`,
    scenes,
    totalShots,
    estimatedDuration,
    agentNotes,
  };
}
