import type { Submission } from '@/features/submissions/types';

export interface EarningsResponse {
  totalEarnings: number;
  submissions: Submission[];
}
