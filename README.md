# Virtue

**Studio-grade AI video generation platform for cinematic workflows.**

Virtue is a production-oriented system for generating, directing, and compositing AI video at Hollywood quality. It provides a screenplay-to-scene pipeline, shot planning, skill-based generation routing, and provider abstraction — all wrapped in a cinematic studio UI.

## Architecture

```
virtue/
├── apps/
│   ├── studio-web/     # Next.js studio interface
│   └── api/            # Hono API server
├── packages/
│   ├── types/          # Zod schemas + TypeScript types
│   ├── config/         # Shared configuration
│   ├── validation/     # Input validation utilities
│   ├── skills-engine/  # Markdown skill loader/parser/matcher
│   ├── provider-sdk/   # Provider interface + registry
│   ├── storyboard-engine/ # Project/scene/shot management
│   ├── render-orchestrator/ # Render job lifecycle
│   └── ui/             # Shared UI components
├── providers/
│   ├── mock/           # Mock provider (development)
│   ├── luma/           # Luma Dream Machine adapter
│   ├── openai/         # OpenAI Sora adapter
│   └── google/         # Google Veo adapter
├── Skills/             # Markdown skill definitions
├── docs/               # Architecture documentation
└── examples/           # Usage examples
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Start both API and studio
pnpm dev

# Or start individually
pnpm api:dev     # API on :4000
pnpm studio:dev  # Studio on :3000
```

## Tech Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: Next.js 14, Tailwind CSS, Zustand
- **Backend**: Hono (lightweight, edge-ready)
- **Types**: Zod schemas, TypeScript strict mode
- **Providers**: Pluggable adapter pattern (mock-first)

## Core Concepts

### Skills
Markdown-defined generation capabilities (cinematic direction, camera choreography, lighting design, etc.) that are parsed, indexed, and matched to generation tasks at runtime. See `docs/skills-system.md`.

### Provider Adapters
Pluggable video generation backends. The mock provider simulates the full pipeline for development. Real providers (Luma, OpenAI, Google) implement the same `VideoProvider` interface. See `docs/provider-adapters.md`.

### Storyboard Engine
Immutable project/scene/shot data model with functional helpers for building cinematic sequences.

### Render Orchestrator
Job lifecycle management: submit, poll, complete/fail. Backed by the provider SDK.

## Documentation

- [Architecture](docs/architecture.md)
- [Skills System](docs/skills-system.md)
- [Provider Adapters](docs/provider-adapters.md)
- [Frontend UX](docs/frontend-ux.md)

## Status

v0.1 — Scaffold release. Core architecture in place. Mock provider active. No external API integrations yet.
