/**
 * Screenplay and concept text parser.
 * Extracts structured scene data from raw text input using
 * deterministic heuristics — no LLM required.
 */

export interface ParsedScene {
  sceneNumber: number;
  heading: string;
  location: string;
  timeOfDay: string;
  body: string;
  characters: string[];
}

// Standard screenplay scene heading pattern:
// INT. LOCATION - DAY
// EXT. LOCATION - NIGHT
// INT./EXT. LOCATION - DAWN
const SCENE_HEADING_RE =
  /^(INT\.|EXT\.|INT\.\/EXT\.|I\/E\.)\s+(.+?)(?:\s*[-–—]\s*(DAY|NIGHT|DAWN|DUSK|MORNING|EVENING|AFTERNOON|CONTINUOUS|LATER|SUNSET|SUNRISE))?$/im;

// Looser heading for less formal scripts: "SCENE 1: Title" or "Scene: Title"
const INFORMAL_HEADING_RE = /^(?:SCENE\s*\d*\s*[:\-–—]\s*)?([A-Z][A-Z\s,.''\-–—]+)$/m;

// Character cue in screenplay format: CHARACTER NAME (in all caps, standalone line)
const CHARACTER_CUE_RE = /^([A-Z][A-Z\s.']+)(?:\s*\(.*\))?$/;

// Time-of-day keywords
const TIME_KEYWORDS: Record<string, string> = {
  day: "day",
  night: "night",
  dawn: "dawn",
  dusk: "dusk",
  morning: "day",
  evening: "dusk",
  afternoon: "day",
  sunset: "dusk",
  sunrise: "dawn",
  continuous: "day",
  later: "day",
};

/**
 * Detect whether input looks like a formatted screenplay.
 */
export function isScreenplayFormat(text: string): boolean {
  const lines = text.split("\n");
  let headingCount = 0;
  for (const line of lines) {
    if (SCENE_HEADING_RE.test(line.trim())) headingCount++;
  }
  return headingCount >= 1;
}

/**
 * Parse screenplay-formatted text into structured scenes.
 */
export function parseScreenplay(text: string): ParsedScene[] {
  const lines = text.split("\n");
  const scenes: ParsedScene[] = [];
  let current: ParsedScene | null = null;
  let bodyLines: string[] = [];
  let sceneCount = 0;

  function flushScene() {
    if (current) {
      current.body = bodyLines.join("\n").trim();
      current.characters = extractCharacters(current.body);
      scenes.push(current);
      bodyLines = [];
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const headingMatch = line.match(SCENE_HEADING_RE);

    if (headingMatch) {
      flushScene();
      sceneCount++;
      const intExt = headingMatch[1];
      const locationRaw = headingMatch[2].trim();
      const timeRaw = (headingMatch[3] || "day").toLowerCase();

      current = {
        sceneNumber: sceneCount,
        heading: line,
        location: locationRaw,
        timeOfDay: TIME_KEYWORDS[timeRaw] || "day",
        body: "",
        characters: [],
      };
    } else if (current) {
      bodyLines.push(rawLine);
    }
  }

  flushScene();

  // If no screenplay headings found, treat the whole text as one scene
  if (scenes.length === 0) {
    return parseConcept(text);
  }

  return scenes;
}

/**
 * Parse a concept/treatment prompt into scenes.
 * Splits on paragraph breaks and infers scene boundaries.
 */
export function parseConcept(text: string): ParsedScene[] {
  // Split on double newlines (paragraphs)
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length === 0) {
    return [
      {
        sceneNumber: 1,
        heading: "Scene 1",
        location: inferLocation(text),
        timeOfDay: inferTimeOfDay(text),
        body: text.trim(),
        characters: extractCharacters(text),
      },
    ];
  }

  // Heuristic: if the text is short (< 3 paragraphs), treat as single scene
  if (paragraphs.length <= 2) {
    const combined = paragraphs.join("\n\n");
    return [
      {
        sceneNumber: 1,
        heading: "Scene 1",
        location: inferLocation(combined),
        timeOfDay: inferTimeOfDay(combined),
        body: combined,
        characters: extractCharacters(combined),
      },
    ];
  }

  // Multiple paragraphs: each becomes a scene
  return paragraphs.map((para, i) => ({
    sceneNumber: i + 1,
    heading: `Scene ${i + 1}`,
    location: inferLocation(para),
    timeOfDay: inferTimeOfDay(para),
    body: para,
    characters: extractCharacters(para),
  }));
}

/**
 * Extract character names from text.
 * Looks for capitalized proper nouns that appear multiple times
 * or screenplay-format character cues.
 */
function extractCharacters(text: string): string[] {
  const chars = new Set<string>();
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    // Screenplay character cue
    const cueMatch = trimmed.match(CHARACTER_CUE_RE);
    if (
      cueMatch &&
      trimmed.length < 40 &&
      !isStageDirection(trimmed)
    ) {
      chars.add(titleCase(cueMatch[1].trim()));
    }
  }

  // Also look for capitalized names in prose (2+ word names, mentioned at least once)
  const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g;
  let match;
  const candidates = new Map<string, number>();
  while ((match = namePattern.exec(text)) !== null) {
    const name = match[1];
    // Filter out common non-name words
    if (!isCommonWord(name)) {
      candidates.set(name, (candidates.get(name) || 0) + 1);
    }
  }
  for (const [name, count] of candidates) {
    if (count >= 2) chars.add(name);
  }

  return Array.from(chars);
}

function isStageDirection(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.startsWith("fade") ||
    lower.startsWith("cut to") ||
    lower.startsWith("dissolve") ||
    lower.startsWith("smash cut") ||
    lower.startsWith("intercut") ||
    lower.startsWith("title card") ||
    lower === "continued" ||
    lower === "more"
  );
}

const COMMON_WORDS = new Set([
  "The", "This", "That", "These", "Those", "Here", "There", "Where",
  "When", "What", "Which", "While", "After", "Before", "Above", "Below",
  "Inside", "Outside", "Through", "Around", "Between", "During",
  "Behind", "Beyond", "Against", "Along", "Under", "Without", "Within",
  "Across", "Toward", "Suddenly", "Finally", "Meanwhile", "Later",
  "Then", "Still", "Just", "Even", "Only", "Almost", "Maybe",
]);

function isCommonWord(word: string): boolean {
  return COMMON_WORDS.has(word) || word.length < 3;
}

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Location Inference ─────────────────────────────────

const LOCATION_PATTERNS: Array<[RegExp, string]> = [
  [/\b(?:city|cities|urban|downtown|skyline|skyscraper|building)\b/i, "City"],
  [/\b(?:forest|woods|trees|jungle|canopy)\b/i, "Forest"],
  [/\b(?:desert|sand|dunes?|arid)\b/i, "Desert"],
  [/\b(?:ocean|sea|water|waves?|shore|beach|coast)\b/i, "Ocean"],
  [/\b(?:mountain|peak|summit|cliff|ridge)\b/i, "Mountains"],
  [/\b(?:space|stars?|cosmos|orbit|nebula|planet|moon)\b/i, "Space"],
  [/\b(?:church|cathedral|temple|chapel|altar)\b/i, "Cathedral"],
  [/\b(?:lab(?:oratory)?|research|facility|bunker)\b/i, "Laboratory"],
  [/\b(?:office|boardroom|corporation|cubicle)\b/i, "Office"],
  [/\b(?:apartment|bedroom|living room|kitchen|house|home)\b/i, "Interior — Residence"],
  [/\b(?:street|road|highway|alley|sidewalk)\b/i, "Street"],
  [/\b(?:bar|pub|club|tavern|saloon)\b/i, "Bar"],
  [/\b(?:warehouse|factory|industrial|dock)\b/i, "Warehouse"],
  [/\b(?:field|meadow|plain|grassland|prairie)\b/i, "Open Field"],
  [/\b(?:cave|cavern|tunnel|underground)\b/i, "Cave"],
  [/\b(?:rain|storm|thunder|lightning)\b/i, "Storm"],
  [/\b(?:snow|ice|frozen|glacier|winter|arctic)\b/i, "Arctic"],
  [/\b(?:rooftop|roof)\b/i, "Rooftop"],
  [/\b(?:bridge)\b/i, "Bridge"],
  [/\b(?:market|bazaar|stall|vendor)\b/i, "Market"],
  [/\b(?:garden|courtyard)\b/i, "Garden"],
  [/\b(?:prison|cell|jail)\b/i, "Prison"],
  [/\b(?:hospital|clinic|medical)\b/i, "Hospital"],
  [/\b(?:station|platform|terminal|airport)\b/i, "Station"],
  [/\b(?:ship|vessel|deck|cabin|yacht)\b/i, "Ship"],
  [/\b(?:train|railway|carriage)\b/i, "Train"],
  [/\b(?:ruin|abandoned|decay|wreck)\b/i, "Ruins"],
];

export function inferLocation(text: string): string {
  for (const [pattern, location] of LOCATION_PATTERNS) {
    if (pattern.test(text)) return location;
  }
  return "Unspecified Location";
}

// ─── Time-of-Day Inference ──────────────────────────────

const TIME_PATTERNS: Array<[RegExp, string]> = [
  [/\b(?:dawn|sunrise|first light|early morning)\b/i, "dawn"],
  [/\b(?:dusk|sunset|twilight|golden hour|evening)\b/i, "dusk"],
  [/\b(?:night|midnight|dark|moonlight|starlight|nocturnal)\b/i, "night"],
  [/\b(?:morning|daylight|noon|afternoon|bright|sun)\b/i, "day"],
];

export function inferTimeOfDay(text: string): string {
  for (const [pattern, time] of TIME_PATTERNS) {
    if (pattern.test(text)) return time;
  }
  return "day";
}
