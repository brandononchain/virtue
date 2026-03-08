import type { VirtueWorkflowStatus } from "@virtue/types";

const workflows = new Map<string, VirtueWorkflowStatus>();

const STAGE_ORDER = [
  "concept", "planning", "previz", "rendering",
  "review", "approved", "final_exported", "archived",
] as const;

function key(targetType: string, targetId: string): string {
  return `${targetType}:${targetId}`;
}

export function setWorkflowStage(
  targetType: VirtueWorkflowStatus["targetType"],
  targetId: string,
  stage: VirtueWorkflowStatus["stage"],
): VirtueWorkflowStatus {
  const status: VirtueWorkflowStatus = {
    targetType,
    targetId,
    stage,
    updatedAt: new Date().toISOString(),
  };
  workflows.set(key(targetType, targetId), status);
  return status;
}

export function getWorkflowStage(
  targetType: VirtueWorkflowStatus["targetType"],
  targetId: string,
): VirtueWorkflowStatus | undefined {
  return workflows.get(key(targetType, targetId));
}

export function advanceWorkflowStage(
  targetType: VirtueWorkflowStatus["targetType"],
  targetId: string,
): VirtueWorkflowStatus | undefined {
  const current = workflows.get(key(targetType, targetId));
  const currentIdx = current
    ? STAGE_ORDER.indexOf(current.stage)
    : -1;

  const nextIdx = currentIdx + 1;
  if (nextIdx >= STAGE_ORDER.length) return current;

  return setWorkflowStage(targetType, targetId, STAGE_ORDER[nextIdx]);
}

export function getStageOrder(): readonly string[] {
  return STAGE_ORDER;
}
