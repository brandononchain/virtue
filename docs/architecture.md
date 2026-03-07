# Architecture

## Overview

Virtue is structured as a pnpm monorepo with Turborepo for build orchestration. The system follows a layered architecture where shared packages define the domain model, and apps consume them.

## Layers

### Domain Layer (`packages/types`, `packages/validation`)
- Zod schemas define the canonical data model: Project, Scene, Shot, Character, Asset, RenderJob, Timeline, Skill, Provider
- Validation utilities wrap Zod parsing for safe input handling
- All types are derived from schemas (single source of truth)

### Engine Layer (`packages/skills-engine`, `packages/storyboard-engine`, `packages/render-orchestrator`)
- **Skills Engine**: Loads markdown skill files, parses them into structured data, and matches generation tasks to relevant skills via keyword scoring
- **Storyboard Engine**: Functional helpers for creating projects, adding scenes/shots, and attaching skills — all immutable operations
- **Render Orchestrator**: Manages render job lifecycle through the provider SDK. Tracks job state and progress

### Provider Layer (`packages/provider-sdk`, `providers/*`)
- `VideoProvider` interface defines the contract: submit, poll, cancel
- `ProviderRegistry` allows runtime registration
- Mock provider simulates full pipeline with staged progress
- Real providers (Luma, OpenAI, Google) are stubbed with the same interface

### Application Layer (`apps/api`, `apps/studio-web`)
- **API**: Hono server exposing REST endpoints for projects, skills, and renders. Uses in-memory store for v0.1
- **Studio Web**: Next.js app with dark cinematic UI. Dashboard, projects, skills browser, render queue

## Data Flow

```
Screenplay → Storyboard Engine → Scenes + Shots
                                      ↓
                              Skills Engine (match)
                                      ↓
                              Render Orchestrator
                                      ↓
                              Provider (submit → poll → complete)
                                      ↓
                              Asset (video output)
```

## Design Decisions

1. **Zod-first**: Schemas are the source of truth. Types are inferred. Validation is collocated
2. **Immutable storyboard ops**: Scene/shot creation returns new project state rather than mutating
3. **Provider abstraction**: Real integrations can be added by implementing `VideoProvider` — no changes to the orchestrator or API
4. **Mock-first**: Development never requires external API keys. The mock provider simulates realistic progress stages
5. **Skills as markdown**: Non-technical team members can author skills. The engine parses them gracefully even if malformed
