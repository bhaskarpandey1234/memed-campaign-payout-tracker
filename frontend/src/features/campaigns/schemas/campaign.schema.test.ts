import { describe, expect, it } from 'vitest';
import { campaignFormSchema } from './campaign.schema';

const valid = { name: 'Creator launch', platform: 'Instagram' as const, budget: '10000.00', milestones: [{ threshold: '10000', payout: '500.00' }, { threshold: '50000', payout: '2000.00' }] };

describe('campaign form validation', () => {
  it('accepts an ordered milestone ladder', () => expect(campaignFormSchema.safeParse(valid).success).toBe(true));
  it('rejects non-increasing view thresholds', () => expect(campaignFormSchema.safeParse({ ...valid, milestones: [{ threshold: '10000', payout: '500.00' }, { threshold: '10000', payout: '2000.00' }] }).success).toBe(false));
  it('rejects a decreasing payout ladder', () => expect(campaignFormSchema.safeParse({ ...valid, milestones: [{ threshold: '10000', payout: '500.00' }, { threshold: '50000', payout: '300.00' }] }).success).toBe(false));
});
