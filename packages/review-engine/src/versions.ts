import type { VirtueVersionSnapshot } from "@virtue/types";

const snapshots = new Map<string, VirtueVersionSnapshot>();

export function createVersionSnapshot(
  targetType: VirtueVersionSnapshot["targetType"],
  targetId: string,
  summary: string,
  metadata?: Record<string, unknown>,
): VirtueVersionSnapshot {
  const snapshot: VirtueVersionSnapshot = {
    id: `ver_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    targetType,
    targetId,
    summary,
    metadata: metadata ?? {},
    createdAt: new Date().toISOString(),
  };
  snapshots.set(snapshot.id, snapshot);
  return snapshot;
}

export function listVersionHistory(
  targetType: VirtueVersionSnapshot["targetType"],
  targetId: string,
): VirtueVersionSnapshot[] {
  return Array.from(snapshots.values())
    .filter((s) => s.targetType === targetType && s.targetId === targetId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getVersionSnapshot(id: string): VirtueVersionSnapshot | undefined {
  return snapshots.get(id);
}
