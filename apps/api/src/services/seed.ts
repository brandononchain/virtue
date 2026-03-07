import type { VirtueProject, VirtueRenderJob } from "@virtue/types";
import { createProject, addScene, addShot } from "@virtue/storyboard-engine";
import { createId, nowISO } from "@virtue/validation";
import { store } from "./store.js";
import { orchestrator } from "./orchestrator.js";

/**
 * Seed the in-memory store with realistic mock data
 * so the studio UI has something to show on first load.
 */
export function seedMockData() {
  // ─── Project 1: Neon City ─────────────────────────────
  let neonCity = createProject(
    "Neon City",
    "A cyberpunk short film about a rogue android searching for meaning in a rain-soaked metropolis."
  );

  neonCity = addScene(neonCity, "Opening — City Reveal", {
    description: "Aerial establishing shot of the neon-lit cityscape at night",
    location: "Neo Tokyo — Upper District",
    timeOfDay: "night",
    mood: "awe, isolation",
  });

  neonCity = addShot(neonCity, neonCity.scenes[0].id, {
    shotType: "aerial",
    description: "Slow drone rise revealing the full skyline with holographic billboards",
    prompt: "Cinematic drone shot rising over a neon-lit cyberpunk city at night, volumetric fog, rain-soaked streets below, holographic billboards flickering, 4K cinematic quality",
    durationSec: 6,
    cameraMove: "crane-up",
    lens: "24mm",
    lighting: "neon + volumetric fog",
    skills: ["skill-cinematic-direction", "skill-camera-choreography", "skill-lighting-design"],
    characterIds: [],
    propIds: [],
  });

  neonCity = addShot(neonCity, neonCity.scenes[0].id, {
    shotType: "wide",
    description: "Street-level establishing of rain-soaked alley with neon reflections",
    prompt: "Wide shot of a cyberpunk alley at night, wet pavement reflecting neon signs, steam rising from grates, cinematic atmosphere",
    durationSec: 4,
    cameraMove: "dolly-forward",
    lens: "35mm",
    lighting: "neon reflections + practical",
    skills: ["skill-scene-simulation", "skill-lighting-design", "skill-visual-style-engine"],
    characterIds: [],
    propIds: [],
  });

  neonCity = addScene(neonCity, "The Awakening", {
    description: "The android protagonist opens its eyes for the first time",
    location: "Abandoned laboratory",
    timeOfDay: "night",
    mood: "tension, curiosity",
  });

  neonCity = addShot(neonCity, neonCity.scenes[1].id, {
    shotType: "extreme-close",
    description: "Extreme close-up of android eye activating — iris dilates",
    prompt: "Extreme close-up of a synthetic eye opening, iris dilating with micro-mechanical detail, cool blue light reflecting, hyperreal macro cinematography",
    durationSec: 3,
    cameraMove: "static",
    lens: "100mm macro",
    lighting: "single key, cold blue",
    skills: ["skill-character-performance", "skill-temporal-consistency"],
    characterIds: [],
    propIds: [],
  });

  neonCity = addShot(neonCity, neonCity.scenes[1].id, {
    shotType: "medium",
    description: "Android sits up on the table, looks around the dark lab",
    prompt: "Medium shot of a humanoid android sitting up on a metal table in a dark abandoned laboratory, dust particles in single shaft of light, cinematic",
    durationSec: 5,
    cameraMove: "slow-push",
    lens: "50mm",
    lighting: "chiaroscuro, single shaft",
    skills: ["skill-character-performance", "skill-cinematic-direction", "skill-physics-engine"],
    characterIds: [],
    propIds: [],
  });

  neonCity = addScene(neonCity, "The Chase", {
    description: "Android is pursued through the market district",
    location: "Neo Tokyo — Market District",
    timeOfDay: "night",
    mood: "urgency, chaos",
  });

  neonCity = addShot(neonCity, neonCity.scenes[2].id, {
    shotType: "pov",
    description: "POV running through crowded market stalls, dodging vendors",
    prompt: "First-person POV running through a dense cyberpunk night market, handheld camera, motion blur, neon signs whipping past, crowd parting",
    durationSec: 4,
    cameraMove: "handheld",
    lens: "18mm",
    lighting: "mixed neon + practicals",
    skills: ["skill-camera-choreography", "skill-physics-engine", "skill-temporal-consistency"],
    characterIds: [],
    propIds: [],
  });

  store.saveProject(neonCity);

  // ─── Project 2: Desert Requiem ─────────────────────────
  let desert = createProject(
    "Desert Requiem",
    "A meditative western about a lone wanderer crossing an endless desert."
  );

  desert = addScene(desert, "Dawn Walk", {
    description: "The wanderer walks across sand dunes at golden hour",
    location: "Saharan desert",
    timeOfDay: "dawn",
    mood: "solitude, beauty",
  });

  desert = addShot(desert, desert.scenes[0].id, {
    shotType: "wide",
    description: "Ultra-wide of lone figure silhouetted against sunrise over dunes",
    prompt: "Ultra-wide cinematic shot of a lone figure walking across vast sand dunes at golden hour, long shadow stretching behind, warm atmospheric haze, Villeneuve-style framing",
    durationSec: 8,
    cameraMove: "static",
    lens: "21mm",
    lighting: "golden hour, backlit",
    skills: ["skill-cinematic-direction", "skill-lighting-design", "skill-visual-style-engine"],
    characterIds: [],
    propIds: [],
  });

  desert = addShot(desert, desert.scenes[0].id, {
    shotType: "close",
    description: "Close-up of weathered boots stepping through sand",
    prompt: "Close-up tracking shot of worn leather boots walking through fine sand, each step sending up small clouds of dust, warm golden light",
    durationSec: 3,
    cameraMove: "tracking",
    lens: "85mm",
    lighting: "golden hour side light",
    skills: ["skill-physics-engine", "skill-temporal-consistency"],
    characterIds: [],
    propIds: [],
  });

  store.saveProject(desert);

  // ─── Project 3: Glass Tower ───────────────────────────
  let glass = createProject(
    "Glass Tower",
    "An architectural thriller set inside an impossible skyscraper."
  );

  glass = addScene(glass, "The Lobby", {
    description: "Camera reveals the impossibly tall atrium of the glass tower",
    location: "Glass Tower — Main Atrium",
    timeOfDay: "day",
    mood: "grandeur, unease",
  });

  glass = addShot(glass, glass.scenes[0].id, {
    shotType: "establishing",
    description: "Tilt-up revealing the impossibly tall glass atrium interior",
    prompt: "Cinematic tilt-up shot inside an impossibly tall glass skyscraper atrium, geometric patterns, natural light streaming through glass panels, tiny figures below for scale",
    durationSec: 6,
    cameraMove: "tilt-up",
    lens: "14mm",
    lighting: "natural diffused",
    skills: ["skill-scene-simulation", "skill-camera-choreography", "skill-cinematic-direction"],
    characterIds: [],
    propIds: [],
  });

  store.saveProject(glass);

  // ─── Render Jobs ──────────────────────────────────────
  const now = nowISO();
  const neonShots = neonCity.scenes.flatMap((s) => s.shots);

  const renderJobs: VirtueRenderJob[] = [
    {
      id: createId(),
      projectId: neonCity.id,
      shotId: neonShots[0].id,
      provider: "mock",
      status: "completed",
      progress: 100,
      prompt: neonShots[0].prompt,
      skills: neonShots[0].skills,
      output: {
        id: createId(),
        projectId: neonCity.id,
        type: "video",
        url: "https://mock.virtue.dev/renders/neon-city-aerial.mp4",
        filename: "neon-city-aerial.mp4",
        metadata: { resolution: "1920x1080", codec: "h264" },
        createdAt: now,
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createId(),
      projectId: neonCity.id,
      shotId: neonShots[1].id,
      provider: "mock",
      status: "generating",
      progress: 58,
      prompt: neonShots[1].prompt,
      skills: neonShots[1].skills,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createId(),
      projectId: neonCity.id,
      shotId: neonShots[2].id,
      provider: "mock",
      status: "queued",
      progress: 0,
      prompt: neonShots[2].prompt,
      skills: neonShots[2].skills,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createId(),
      projectId: neonCity.id,
      shotId: neonShots[3].id,
      provider: "mock",
      status: "preparing",
      progress: 12,
      prompt: neonShots[3].prompt,
      skills: neonShots[3].skills,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createId(),
      projectId: neonCity.id,
      shotId: neonShots[4].id,
      provider: "mock",
      status: "failed",
      progress: 0,
      prompt: neonShots[4].prompt,
      skills: neonShots[4].skills,
      error: "Provider timeout after 120s — retry recommended",
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const job of renderJobs) {
    store.saveRenderJob(job);
    orchestrator.importJob(job);
  }
}
