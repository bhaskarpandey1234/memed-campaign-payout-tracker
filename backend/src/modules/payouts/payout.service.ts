import type { Milestone, PayoutResult } from './payout.types';

export function calculatePayout(
  views: number,
  milestones: Milestone[],
  alreadyCredited = 0,
): PayoutResult {
  const reached = milestones.filter((milestone) => views >= milestone.threshold).sort((a, b) => a.threshold - b.threshold).at(-1);
  const targetPayout = reached?.payout ?? 0;
  return {
    highestMilestone: reached?.threshold ?? 0,
    targetPayout,
    incrementalPayout: Math.max(0, targetPayout - alreadyCredited),
  };
}

export function capPayout(incrementalPayout: number, remainingBudget: number) {
  return Math.max(0, Math.min(incrementalPayout, remainingBudget));
}
