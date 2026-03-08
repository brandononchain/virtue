# World State

World state is the central data structure that tracks the current condition of all entities in a Virtue project across scenes.

## Schema

### VirtueWorldState
| Field | Type | Description |
|-------|------|-------------|
| `projectId` | string | Associated project |
| `characters` | CharacterState[] | All tracked characters |
| `environments` | EnvironmentState[] | All tracked environments |
| `props` | PropState[] | All tracked props |
| `storyEvents` | StoryEvent[] | Timeline of narrative events |
| `timelinePosition` | number | Current position in story |
| `activeConditions` | string[] | Global narrative conditions |
| `updatedAt` | datetime | Last modification time |

### Character State
| Field | Type | Default |
|-------|------|---------|
| `characterId` | string | — |
| `location` | string | "unknown" |
| `emotionalState` | string | "neutral" |
| `physicalCondition` | string | "normal" |
| `possessions` | string[] | [] |
| `relationships` | Record<string, string> | {} |

### Environment State
| Field | Type | Default |
|-------|------|---------|
| `environmentId` | string | — |
| `timeOfDay` | string | "day" |
| `weather` | string | "clear" |
| `damageState` | string | "intact" |
| `lightingState` | string | "natural" |
| `occupancy` | string[] | [] |

### Prop State
| Field | Type | Default |
|-------|------|---------|
| `propId` | string | — |
| `location` | string | "unknown" |
| `owner` | string? | — |
| `condition` | string | "intact" |
| `visibility` | "visible" \| "hidden" \| "destroyed" | "visible" |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/simulation/world/:projectId` | Get or auto-initialize world state |
| POST | `/api/simulation/world/:projectId/initialize` | Force re-initialize world state |
| POST | `/api/simulation/world/:projectId/update` | Batch update characters, environments, props, conditions |
| POST | `/api/simulation/world/:projectId/event` | Add a story event |
| POST | `/api/simulation/simulate/scene` | Simulate scene impact on world |
| GET | `/api/simulation/context/:projectId/:sceneId` | Get simulation context + prompt fragment |

## Studio UI

The World page (`/studio/world`) provides:
- Project and scene selectors
- World stats overview cards
- Active conditions display
- Tabbed views: Characters, Environments, Props, Story Events, World Graph
- Inline character state editing
- Scene simulation trigger
