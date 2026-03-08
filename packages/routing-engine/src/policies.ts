import type { VirtueRoutingPolicy } from "@virtue/types";

/**
 * Predefined routing policies with tuned weight distributions.
 */
export const ROUTING_POLICIES: Record<string, VirtueRoutingPolicy> = {
  auto_quality: {
    mode: "auto_quality",
    qualityWeight: 0.7,
    speedWeight: 0.1,
    costWeight: 0.2,
  },
  auto_speed: {
    mode: "auto_speed",
    qualityWeight: 0.2,
    speedWeight: 0.6,
    costWeight: 0.2,
  },
  auto_cost: {
    mode: "auto_cost",
    qualityWeight: 0.2,
    speedWeight: 0.2,
    costWeight: 0.6,
  },
  balanced: {
    mode: "balanced",
    qualityWeight: 0.4,
    speedWeight: 0.3,
    costWeight: 0.3,
  },
  manual: {
    mode: "manual",
    qualityWeight: 0,
    speedWeight: 0,
    costWeight: 0,
  },
};

export function getDefaultPolicy(): VirtueRoutingPolicy {
  return ROUTING_POLICIES.balanced;
}
