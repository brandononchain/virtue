# Skills System

## Overview

Virtue's Skills system defines the generation capabilities available to the platform. Each skill is a markdown file in the `/Skills` directory that describes a specific aspect of cinematic video generation.

## Skill Structure

Each skill file follows this format:

```markdown
# Skill: [Name]

## Purpose
[What this skill does]

## Responsibilities
- [Bullet list of what it handles]

## Inputs
- [What it needs]

## Outputs
[What it produces]

## Example
[Optional usage example]
```

All sections are optional. The parser handles missing or malformed sections gracefully.

## Available Skills

| Skill | Purpose |
|-------|---------|
| Camera Choreography | Camera movement and motion language |
| Character Performance | Human/character motion and expression |
| Cinematic Direction | High-level scene direction from prompts |
| Lighting Design | Cinematic lighting setups |
| Physics Engine | Believable motion and world interactions |
| Post Production | Film finishing (grain, DoF, grading) |
| Scene Simulation | Physically consistent environments |
| Storyboard Generator | Narrative prompt → shot sequences |
| Temporal Consistency | Visual continuity across frames |
| Visual Style Engine | Consistent visual identity and style |

## Skill Matching

The `matchSkills()` function takes a text query and scores each skill by keyword overlap against the skill's name, purpose, responsibilities, inputs, and outputs.

```typescript
import { loadSkillsFromDirectory, matchSkills } from "@virtue/skills-engine";

const skills = await loadSkillsFromDirectory("./Skills");
const relevant = matchSkills("epic drone shot of futuristic city at sunset", skills);
// Returns: Camera Choreography, Cinematic Direction, Scene Simulation, Lighting Design, ...
```

## Adding New Skills

1. Create a kebab-case `.md` file in `/Skills`
2. Follow the section format above (minimum: title + purpose)
3. The engine will pick it up automatically on next load

## Parser Details

- Title: extracted from `# Skill: Name` or `# Name`
- Sections: matched by `## Heading` and captured until the next heading
- Lists: lines starting with `-` or `*` are extracted as arrays
- Graceful fallback: missing sections return empty strings/arrays
