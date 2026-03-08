# Render Pipeline

## Overview

The render pipeline takes a shot's prompt and sends it through a video generation provider, polling for completion, and delivering the result to the studio UI.

## Flow

1. **Submit**: User selects a shot, edits the prompt, picks a provider, and clicks "Render"
2. **API**: `POST /api/renders` creates a job, validates the shot, and calls `orchestrator.submitJob()`
3. **Orchestrator**: Looks up the provider from the registry, calls `provider.submit()`, saves the job
4. **Auto-poll**: The orchestrator starts a polling timer (10s for real providers, 2s for mock)
5. **Provider poll**: Each tick calls `provider.poll(jobId)`, updates status/progress
6. **Completion**: When the provider returns `completed`, the output URL is stored on the job
7. **UI**: The studio-web polls `GET /api/renders` every 5s while active jobs exist, showing live progress
8. **Video player**: On completion, the video URL is rendered in an HTML5 `<video>` player

## Statuses

| Status | Description |
|--------|-------------|
| `queued` | Job created, waiting for provider |
| `preparing` | Provider is setting up |
| `generating` | Video generation in progress |
| `post-processing` | Provider is finalizing |
| `completed` | Video ready, output URL available |
| `failed` | Generation failed, error message available |

## Provider Selection

The API accepts an optional `provider` field in `POST /api/renders`. If omitted, the default provider is used (configured via `DEFAULT_PROVIDER` env var). The UI presents all registered providers with availability status.

## API Endpoints

- `GET /api/renders/providers` — List registered providers and their availability
- `POST /api/renders` — Submit a render job (accepts `projectId`, `sceneId`, `shotId`, `provider?`, `prompt?`)
- `GET /api/renders` — List all jobs (optional `?projectId=` filter)
- `GET /api/renders/:id` — Get a specific job
- `POST /api/renders/:id/poll` — Manually advance a job (useful for mock provider)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LUMA_API_KEY` | For Luma | Luma AI API key |
| `DEFAULT_PROVIDER` | No | Default provider name (`mock` or `luma`). Defaults to `mock` |
| `API_PORT` | No | API server port. Defaults to `4000` |

## Running with Mock

No configuration needed. The mock provider is always available and advances one stage per poll.

## Running with Luma

```bash
LUMA_API_KEY=your-key-here DEFAULT_PROVIDER=luma pnpm api:dev
```

Or add to `.env`:
```
LUMA_API_KEY=your-key-here
DEFAULT_PROVIDER=luma
```
