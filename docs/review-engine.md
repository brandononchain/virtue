# Review Engine

The `@virtue/review-engine` package provides the collaboration and production review layer for Virtue. It manages comments, approvals, alternate takes, version history, compare sessions, and production workflow stages.

## Architecture

```
review-engine/
├── comments.ts      # Comment threads on any target
├── approvals.ts     # Approval state per target
├── takes.ts         # Alternate render takes per shot
├── versions.ts      # Version history snapshots
├── compare.ts       # Side-by-side render comparison
├── workflow.ts      # Production workflow stages
└── index.ts         # Public API
```

All state is stored in-memory using Maps for v0.1. The API is designed for easy migration to database-backed persistence.

## Comments

Comment on any targetable object: project, scene, shot, render, timeline, or export.

```typescript
import { addComment, listComments, resolveComment } from "@virtue/review-engine";

const comment = addComment("shot", "shot_123", "Motion feels too fast", "Director");
const thread = listComments("shot", "shot_123");
resolveComment(comment.id);
```

Features:
- Threaded replies via `parentCommentId`
- Resolve/reopen workflow
- Lightweight author metadata
- Timestamp tracking

## Approvals

Track approval state for scenes, shots, renders, and exports.

```typescript
import { setApprovalState, getApprovalState } from "@virtue/review-engine";

setApprovalState("shot", "shot_123", "approved", "Director", "Looks great");
const approval = getApprovalState("shot", "shot_123");
```

States: `pending`, `needs_changes`, `approved`, `rejected`

## Alternate Takes

Each shot can have multiple render takes with different providers, prompts, or settings.

```typescript
import { createAlternateTake, selectTake, listAlternateTakes } from "@virtue/review-engine";

const take = createAlternateTake("shot_123", "render_456", "luma", "v2 prompt");
selectTake(take.id); // marks as selected, deselects others
```

Take statuses: `active`, `selected`, `favorite`, `archived`

## Version History

Track meaningful changes to any target object.

```typescript
import { createVersionSnapshot, listVersionHistory } from "@virtue/review-engine";

createVersionSnapshot("shot", "shot_123", "Prompt updated for better lighting", {
  previousPrompt: "...",
  newPrompt: "...",
});
const history = listVersionHistory("shot", "shot_123");
```

## Compare Sessions

Compare two or more renders side by side and select a winner.

```typescript
import { createCompareSession, selectCompareWinner } from "@virtue/review-engine";

const session = createCompareSession(["render_1", "render_2"]);
selectCompareWinner(session.id, "render_1");
```

## Workflow Stages

Track production progress for projects and scenes.

```typescript
import { setWorkflowStage, advanceWorkflowStage } from "@virtue/review-engine";

setWorkflowStage("project", "proj_123", "rendering");
advanceWorkflowStage("project", "proj_123"); // → "review"
```

Stage order: concept → planning → previz → rendering → review → approved → final_exported → archived
