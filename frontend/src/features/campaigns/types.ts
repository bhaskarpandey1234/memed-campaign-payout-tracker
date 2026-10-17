export interface Milestone {
  threshold: number;
  payout: number;
}

export interface Campaign {
  _id: string;
  id?: string;
  name: string;
  platform: string;
  totalBudget: number;
  spent: number;
  remainingBudget: number;
  milestones: Milestone[];
  status?: 'active' | 'exhausted';
  createdAt?: string;
  updatedAt?: string;
}
