# Frontend UX

## Design Philosophy

Virtue Studio targets a cinematic, professional aesthetic closer to DaVinci Resolve, Unreal Engine, or Premiere Pro than typical SaaS dashboards.

### Principles
- **Dark-first**: Deep blacks (#0a0a0a), zinc borders, minimal color
- **Information density**: Studio panels show data compactly without clutter
- **Status clarity**: Render states use distinct color-coded chips
- **Precision typography**: Small, uppercase labels; monospace for IDs; Inter for body

## Pages

### Dashboard (`/`)
Overview of system state. Stat cards, quick actions, and provider status.

### Projects (`/projects`)
Grid of project cards with inline creation. Each card shows scene count and provider.

### Project Detail (`/projects/[id]`)
Scene list with inline shot count. Add scenes directly. Stats bar for project-level metrics.

### Skills Browser (`/skills`)
Split-panel layout: skill list on the left, detail view on the right. Shows purpose, responsibilities, inputs, outputs, and examples.

### Render Queue (`/renders`)
List of render jobs with progress bars, status chips, and poll buttons for mock advancement.

## Component Library (`@virtue/ui`)

Shared components following the studio design language:
- `Panel` — bordered container with optional title header
- `Card` — interactive card with hover state
- `StatusChip` — colored status indicator
- `cn()` — Tailwind class merge utility

## State Management

Zustand store (`useStudioStore`) holds:
- Project list and current project
- Skills catalog
- Render jobs
- UI state (sidebar toggle)

## API Client

The `api` module in `src/lib/api.ts` wraps all backend calls with typed fetch helpers.
