import type { VirtueComment } from "@virtue/types";

const comments = new Map<string, VirtueComment>();

function targetKey(targetType: string, targetId: string): string {
  return `${targetType}:${targetId}`;
}

export function addComment(
  targetType: VirtueComment["targetType"],
  targetId: string,
  body: string,
  authorName?: string,
  parentCommentId?: string,
): VirtueComment {
  const comment: VirtueComment = {
    id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    targetType,
    targetId,
    authorName: authorName || "Anonymous",
    body,
    parentCommentId,
    createdAt: new Date().toISOString(),
  };
  comments.set(comment.id, comment);
  return comment;
}

export function listComments(
  targetType: VirtueComment["targetType"],
  targetId: string,
): VirtueComment[] {
  const key = targetKey(targetType, targetId);
  return Array.from(comments.values())
    .filter((c) => targetKey(c.targetType, c.targetId) === key)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getComment(commentId: string): VirtueComment | undefined {
  return comments.get(commentId);
}

export function resolveComment(commentId: string): VirtueComment | undefined {
  const comment = comments.get(commentId);
  if (!comment) return undefined;
  const updated = { ...comment, resolvedAt: new Date().toISOString() };
  comments.set(commentId, updated);
  return updated;
}

export function reopenComment(commentId: string): VirtueComment | undefined {
  const comment = comments.get(commentId);
  if (!comment) return undefined;
  const updated = { ...comment, resolvedAt: undefined };
  comments.set(commentId, updated);
  return updated;
}

export function getCommentThread(commentId: string): VirtueComment[] {
  const root = comments.get(commentId);
  if (!root) return [];
  const replies = Array.from(comments.values())
    .filter((c) => c.parentCommentId === commentId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return [root, ...replies];
}
