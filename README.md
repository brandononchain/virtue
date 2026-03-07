# Virtue

**Studio-grade AI video generation platform for cinematic workflows.**

Virtue is a production system for generating, directing, and compositing AI video at Hollywood quality. It provides a screenplay-to-scene pipeline, shot planning, skill-based generation routing, and provider abstraction — wrapped in a cinematic studio UI.

---

## Quick Start

```bash
# Prerequisites: Node >= 20, pnpm >= 9
pnpm install

# Start the API and Studio UI together
pnpm dev

# Or start individually
pnpm api:dev       # API → http://localhost:4000
pnpm studio:dev    # Studio → http://localhost:3000
```

The API seeds itself with 3 demo projects (Neon City, Desert Requiem, Glass Tower) and 5 render jobs in various states. Open the Studio UI and explore immediately.

## Architecture

```
virtue/
├── apps/
│   ├── studio-web/           # Next.js 14 studio interface
│   └── api/                  # Hono API server
├── packages/
│   ├── types/                # Zod schemas + TypeScript types
│   ├── config/               # Shared configuration
│   ├── validation/           # Input validation + ID utilities
│   ├── skills-engine/        # Markdown skill loader, parser, matcher
│   ├── provider-sdk/         # VideoProvider interface + registry
│   ├── storyboard-engine/    # Project → scene → shot data model
│   ├── render-orchestrator/  # Render job lifecycle management
│   └── ui/                   # Shared UI components
├── providers/
│   ├── mock/                 # Mock provider (development)
│   ├── luma/                 # Luma Dream Machine adapter (stub)
│   ├── openai/               # OpenAI Sora adapter (stub)
│   └── google/               # Google Veo adapter (stub)
├── Skills/                   # Markdown skill definitions
├── docs/                     # Architecture documentation
└── examples/                 # Usage examples
```

### Data flow

```
Screenplay → Scenes → Shots → Skills matched → Provider selected → Render job → Output asset
```

The storyboard engine manages the project data model. When a render is submitted, the render orchestrator delegates to a video provider (currently mock). Skills are matched to shots by keyword relevance and attached as metadata.

## Core Concepts

### Domain Model

| Entity | Description |
|---|---|
| `VirtueProject` | Top-level container. Has scenes, characters, assets, timeline. |
| `VirtueScene` | A narrative beat. Has location, mood, time of day, and shots. |
| `VirtueShot` | A single camera setup. Has type, prompt, duration, camera, lens, lighting, skills. |
| `VirtueRenderJob` | A generation job. Tracks status from queued → generating → completed. |
| `VirtueSkill` | A parsed markdown capability (e.g., Camera Choreography, Lighting Design). |
| `VirtueProvider` | A video generation backend (mock, luma, openai, google). |

All types are Zod schemas in `packages/types`. Use `validateProject()`, `validateShot()`, etc. from `packages/validation`.

### Skills Engine

Skills are markdown files in `/Skills`. The engine:

1. **Loads** all `.md` files from a directory
2. **Parses** title, purpose, responsibilities, inputs, outputs, examples
3. **Matches** skills to generation tasks by keyword scoring

```typescript
import { loadSkillsFromDirectory, matchSkills } from "@virtue/skills-engine";

const skills = await loadSkillsFromDirectory("./Skills");
const relevant = matchSkills("cinematic drone shot at sunset", skills);
```

### Provider System

All providers implement `VideoProvider` from `@virtue/provider-sdk`:

```typescript
interface VideoProvider {
  name: ProviderName;
  displayName: string;
  isAvailable(): Promise<boolean>;
  submit(request: GenerationRequest): Promise<GenerationResult>;
  poll(jobId: string): Promise<GenerationResult>;
  cancel(jobId: string): Promise<void>;
}
```

The mock provider simulates a 6-stage pipeline (queued → preparing → generating → generating → post-processing → completed) with one stage advancing per poll.

## Studio UI

The frontend is a dark, studio-grade interface:

- **Dashboard** — Stats, recent projects, render activity, system status
- **Projects** — Create/browse projects, add scenes and shots
- **Project Detail** — Scene list, shot list, shot creation form, shot detail panel
- **Render Queue** — Filter by status, progress bars, job detail panel
- **Skills Browser** — Split-pane with search, structured detail view, raw markdown toggle

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/stats` | Dashboard statistics |
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create project |
| `GET` | `/api/projects/:id` | Get project |
| `DELETE` | `/api/projects/:id` | Delete project |
| `POST` | `/api/projects/:id/scenes` | Add scene |
| `POST` | `/api/projects/:id/scenes/:sceneId/shots` | Add shot |
| `GET` | `/api/skills` | List all skills |
| `GET` | `/api/skills/:slug` | Get skill by slug |
| `POST` | `/api/skills/match` | Match skills to query |
| `GET` | `/api/renders` | List render jobs |
| `POST` | `/api/renders` | Submit render job |
| `POST` | `/api/renders/:id/poll` | Advance render state |

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | Next.js 14, Tailwind CSS, Zustand |
| Backend | Hono (TypeScript, edge-ready) |
| Schemas | Zod (runtime validation + type inference) |
| Providers | Pluggable adapter pattern |
| Build | TypeScript strict, ESM |

## Scripts

```bash
pnpm dev          # Start all apps in development
pnpm build        # Build all packages and apps
pnpm type-check   # Run TypeScript checks across workspace
pnpm clean        # Remove all dist/ and .next/ directories
pnpm api:dev      # Start API server only
pnpm studio:dev   # Start Studio UI only
```

## Adding a Provider

1. Create `providers/your-provider/src/index.ts`
2. Implement the `VideoProvider` interface
3. Register it in `apps/api/src/services/orchestrator.ts`
4. Add the provider name to the `ProviderName` enum in `packages/types`

## Adding a Skill

1. Create `Skills/your-skill.md` with the standard format:
   ```markdown
   # Skill: Your Skill Name
   ## Purpose
   ## Responsibilities
   ## Inputs
   ## Outputs
   ## Example
   ```
2. The skills engine will automatically load and parse it on next API start.

## Documentation

- [Architecture](docs/architecture.md)
- [Skills System](docs/skills-system.md)
- [Provider Adapters](docs/provider-adapters.md)
- [Frontend UX](docs/frontend-ux.md)

## Status

v0.1 — Scaffold release. Core architecture, mock provider, seed data, studio UI shell. No external API integrations yet.
