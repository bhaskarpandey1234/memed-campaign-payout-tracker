export interface ViewUpdateResponse {
  submission: unknown;
  campaign: { id: string; spent: number; remainingBudget: number };
}
