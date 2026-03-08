import { Hono } from "hono";
import {
  addComment,
  listComments,
  resolveComment,
  reopenComment,
  getCommentThread,
  setApprovalState,
  getApprovalState,
  listApprovals,
  createAlternateTake,
  listAlternateTakes,
  selectTake,
  favoriteTake,
  archiveTake,
  createVersionSnapshot,
  listVersionHistory,
  createCompareSession,
  getCompareSession,
  selectCompareWinner,
  listCompareSessions,
  setWorkflowStage,
  getWorkflowStage,
  advanceWorkflowStage,
  getStageOrder,
} from "@virtue/review-engine";
import { store } from "../services/store";

export const reviewRoutes = new Hono();

// ─── Comments ──────────────────────────────────────────

reviewRoutes.get("/comments/:targetType/:targetId", (c) => {
  const { targetType, targetId } = c.req.param();
  const items = listComments(targetType as any, targetId);
  return c.json(items);
});

reviewRoutes.post("/comments", async (c) => {
  const { targetType, targetId, body, authorName, parentCommentId } = await c.req.json();
  if (!targetType || !targetId || !body) {
    return c.json({ error: "targetType, targetId, and body are required" }, 400);
  }
  const comment = addComment(targetType, targetId, body, authorName, parentCommentId);
  return c.json(comment, 201);
});

reviewRoutes.post("/comments/:id/resolve", (c) => {
  const comment = resolveComment(c.req.param("id"));
  if (!comment) return c.json({ error: "Comment not found" }, 404);
  return c.json(comment);
});

reviewRoutes.post("/comments/:id/reopen", (c) => {
  const comment = reopenComment(c.req.param("id"));
  if (!comment) return c.json({ error: "Comment not found" }, 404);
  return c.json(comment);
});

reviewRoutes.get("/comments/:id/thread", (c) => {
  const thread = getCommentThread(c.req.param("id"));
  if (thread.length === 0) return c.json({ error: "Comment not found" }, 404);
  return c.json(thread);
});

// ─── Approvals ─────────────────────────────────────────

reviewRoutes.get("/approvals/:targetType/:targetId", (c) => {
  const { targetType, targetId } = c.req.param();
  const approval = getApprovalState(targetType as any, targetId);
  if (!approval) {
    return c.json({
      targetType,
      targetId,
      state: "pending",
      updatedAt: new Date().toISOString(),
    });
  }
  return c.json(approval);
});

reviewRoutes.post("/approvals", async (c) => {
  const { targetType, targetId, state, reviewerName, notes } = await c.req.json();
  if (!targetType || !targetId || !state) {
    return c.json({ error: "targetType, targetId, and state are required" }, 400);
  }
  const approval = setApprovalState(targetType, targetId, state, reviewerName, notes);
  return c.json(approval);
});

reviewRoutes.get("/approvals", (c) => {
  const targetType = c.req.query("targetType");
  return c.json(listApprovals(targetType as any));
});

// ─── Alternate Takes ───────────────────────────────────

reviewRoutes.get("/shots/:shotId/takes", (c) => {
  const takes = listAlternateTakes(c.req.param("shotId"));
  return c.json(takes);
});

reviewRoutes.post("/shots/:shotId/takes", async (c) => {
  const shotId = c.req.param("shotId");
  const { renderJobId, provider, promptVersion, continuityContextVersion, routingDecision, label } =
    await c.req.json();
  if (!renderJobId || !provider || !promptVersion) {
    return c.json({ error: "renderJobId, provider, and promptVersion are required" }, 400);
  }
  const take = createAlternateTake(shotId, renderJobId, provider, promptVersion, {
    continuityContextVersion,
    routingDecision,
    label,
  });
  return c.json(take, 201);
});

reviewRoutes.post("/shots/:shotId/takes/:takeId/select", (c) => {
  const take = selectTake(c.req.param("takeId"));
  if (!take) return c.json({ error: "Take not found" }, 404);
  return c.json(take);
});

reviewRoutes.post("/shots/:shotId/takes/:takeId/favorite", (c) => {
  const take = favoriteTake(c.req.param("takeId"));
  if (!take) return c.json({ error: "Take not found" }, 404);
  return c.json(take);
});

reviewRoutes.post("/shots/:shotId/takes/:takeId/archive", (c) => {
  const take = archiveTake(c.req.param("takeId"));
  if (!take) return c.json({ error: "Take not found" }, 404);
  return c.json(take);
});

// ─── Version History ───────────────────────────────────

reviewRoutes.get("/versions/:targetType/:targetId", (c) => {
  const { targetType, targetId } = c.req.param();
  return c.json(listVersionHistory(targetType as any, targetId));
});

reviewRoutes.post("/versions/snapshot", async (c) => {
  const { targetType, targetId, summary, metadata } = await c.req.json();
  if (!targetType || !targetId || !summary) {
    return c.json({ error: "targetType, targetId, and summary are required" }, 400);
  }
  const snapshot = createVersionSnapshot(targetType, targetId, summary, metadata);
  return c.json(snapshot, 201);
});

// ─── Compare Sessions ──────────────────────────────────

reviewRoutes.post("/compare", async (c) => {
  const { renderIds, notes, metadata } = await c.req.json();
  if (!renderIds || renderIds.length < 2) {
    return c.json({ error: "At least 2 renderIds are required" }, 400);
  }

  // Enrich with render job metadata
  const enriched: Record<string, unknown> = { ...metadata };
  const renders: Record<string, unknown>[] = [];
  for (const id of renderIds) {
    const job = store.getRenderJob(id);
    if (job) {
      renders.push({
        id: job.id,
        provider: job.provider,
        status: job.status,
        prompt: job.prompt,
        output: job.output,
      });
    }
  }
  enriched.renders = renders;

  const session = createCompareSession(renderIds, notes, enriched);
  return c.json(session, 201);
});

reviewRoutes.get("/compare", (_c) => {
  return _c.json(listCompareSessions());
});

reviewRoutes.get("/compare/:id", (c) => {
  const session = getCompareSession(c.req.param("id"));
  if (!session) return c.json({ error: "Compare session not found" }, 404);
  return c.json(session);
});

reviewRoutes.post("/compare/:id/winner", async (c) => {
  const { winnerId } = await c.req.json();
  if (!winnerId) return c.json({ error: "winnerId is required" }, 400);
  const session = selectCompareWinner(c.req.param("id"), winnerId);
  if (!session) return c.json({ error: "Compare session not found" }, 404);
  return c.json(session);
});

// ─── Workflow ──────────────────────────────────────────

reviewRoutes.get("/workflow/:targetType/:targetId", (c) => {
  const { targetType, targetId } = c.req.param();
  const status = getWorkflowStage(targetType as any, targetId);
  if (!status) {
    return c.json({
      targetType,
      targetId,
      stage: "concept",
      updatedAt: new Date().toISOString(),
    });
  }
  return c.json(status);
});

reviewRoutes.post("/workflow/stage", async (c) => {
  const { targetType, targetId, stage } = await c.req.json();
  if (!targetType || !targetId || !stage) {
    return c.json({ error: "targetType, targetId, and stage are required" }, 400);
  }
  const status = setWorkflowStage(targetType, targetId, stage);
  return c.json(status);
});

reviewRoutes.post("/workflow/advance", async (c) => {
  const { targetType, targetId } = await c.req.json();
  if (!targetType || !targetId) {
    return c.json({ error: "targetType and targetId are required" }, 400);
  }
  const status = advanceWorkflowStage(targetType, targetId);
  if (!status) return c.json({ error: "Cannot advance further" }, 400);
  return c.json(status);
});

reviewRoutes.get("/workflow/stages", (_c) => {
  return _c.json(getStageOrder());
});
