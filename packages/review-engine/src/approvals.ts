import type { VirtueApproval } from "@virtue/types";

const approvals = new Map<string, VirtueApproval>();

function key(targetType: string, targetId: string): string {
  return `${targetType}:${targetId}`;
}

export function setApprovalState(
  targetType: VirtueApproval["targetType"],
  targetId: string,
  state: VirtueApproval["state"],
  reviewerName?: string,
  notes?: string,
): VirtueApproval {
  const approval: VirtueApproval = {
    targetType,
    targetId,
    state,
    reviewerName,
    notes,
    updatedAt: new Date().toISOString(),
  };
  approvals.set(key(targetType, targetId), approval);
  return approval;
}

export function getApprovalState(
  targetType: VirtueApproval["targetType"],
  targetId: string,
): VirtueApproval | undefined {
  return approvals.get(key(targetType, targetId));
}

export function listApprovals(
  targetType?: VirtueApproval["targetType"],
): VirtueApproval[] {
  const all = Array.from(approvals.values());
  if (targetType) return all.filter((a) => a.targetType === targetType);
  return all;
}
