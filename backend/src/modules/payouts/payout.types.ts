export interface Milestone {
  threshold: number;
  payout: number;
}

export interface PayoutResult {
  highestMilestone: number;
  targetPayout: number;
  incrementalPayout: number;
}
