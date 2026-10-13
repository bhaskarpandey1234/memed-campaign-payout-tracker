import { api } from '@/lib/api/client';
import type { EarningsResponse } from '../types';

export function getMyEarnings() {
  return api<EarningsResponse>('/earnings/me');
}
