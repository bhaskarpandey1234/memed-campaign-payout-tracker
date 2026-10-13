import { api } from '@/lib/api/client';
import type { Campaign, Milestone } from '../types';

export function getMyCampaigns() {
  return api<{ campaigns: Campaign[] }>('/campaigns/mine');
}

export function getLiveCampaigns() {
  return api<{ campaigns: Campaign[] }>('/campaigns/live');
}

export function createCampaign(input: { name: string; platform: string; totalBudget: number; milestones: Milestone[] }) {
  return api<{ campaign: Campaign }>('/campaigns', {
    method: 'POST',
    headers: { 'Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify(input),
  });
}
