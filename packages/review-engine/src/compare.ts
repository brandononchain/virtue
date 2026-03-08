import type { VirtueCompareSession } from "@virtue/types";

const sessions = new Map<string, VirtueCompareSession>();

export function createCompareSession(
  renderIds: string[],
  notes?: string,
  metadata?: Record<string, unknown>,
): VirtueCompareSession {
  const session: VirtueCompareSession = {
    id: `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    renderIds,
    notes,
    metadata: metadata ?? {},
    createdAt: new Date().toISOString(),
  };
  sessions.set(session.id, session);
  return session;
}

export function getCompareSession(id: string): VirtueCompareSession | undefined {
  return sessions.get(id);
}

export function selectCompareWinner(
  sessionId: string,
  winnerId: string,
): VirtueCompareSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;
  const updated = { ...session, winnerId };
  sessions.set(sessionId, updated);
  return updated;
}

export function listCompareSessions(): VirtueCompareSession[] {
  return Array.from(sessions.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
