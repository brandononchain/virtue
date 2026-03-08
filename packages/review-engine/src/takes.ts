import type { VirtueAlternateTake, VirtueRoutingDecision } from "@virtue/types";

const takes = new Map<string, VirtueAlternateTake>();

export function createAlternateTake(
  shotId: string,
  renderJobId: string,
  provider: VirtueAlternateTake["provider"],
  promptVersion: string,
  opts?: {
    continuityContextVersion?: string;
    routingDecision?: VirtueRoutingDecision;
    label?: string;
  },
): VirtueAlternateTake {
  const take: VirtueAlternateTake = {
    id: `take_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    shotId,
    renderJobId,
    provider,
    promptVersion,
    continuityContextVersion: opts?.continuityContextVersion,
    routingDecision: opts?.routingDecision,
    status: "active",
    label: opts?.label,
    createdAt: new Date().toISOString(),
  };
  takes.set(take.id, take);
  return take;
}

export function listAlternateTakes(shotId: string): VirtueAlternateTake[] {
  return Array.from(takes.values())
    .filter((t) => t.shotId === shotId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getTake(takeId: string): VirtueAlternateTake | undefined {
  return takes.get(takeId);
}

export function selectTake(takeId: string): VirtueAlternateTake | undefined {
  const take = takes.get(takeId);
  if (!take) return undefined;

  // Deselect other takes for this shot
  for (const t of takes.values()) {
    if (t.shotId === take.shotId && t.id !== takeId && t.status === "selected") {
      takes.set(t.id, { ...t, status: "active" });
    }
  }

  const updated = { ...take, status: "selected" as const };
  takes.set(takeId, updated);
  return updated;
}

export function favoriteTake(takeId: string): VirtueAlternateTake | undefined {
  const take = takes.get(takeId);
  if (!take) return undefined;
  const updated = { ...take, status: "favorite" as const };
  takes.set(takeId, updated);
  return updated;
}

export function archiveTake(takeId: string): VirtueAlternateTake | undefined {
  const take = takes.get(takeId);
  if (!take) return undefined;
  const updated = { ...take, status: "archived" as const };
  takes.set(takeId, updated);
  return updated;
}
