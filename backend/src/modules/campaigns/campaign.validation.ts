import { z } from 'zod';

export const campaignSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    platform: z.enum(['Instagram', 'YouTube']),
    totalBudget: z.number().int().positive(),
    milestones: z
      .array(z.object({ threshold: z.number().int().positive(), payout: z.number().int().nonnegative() }))
      .min(1),
  })
  .superRefine((value, context) => {
    for (let index = 1; index < value.milestones.length; index += 1) {
      if (value.milestones[index].threshold <= value.milestones[index - 1].threshold) {
        context.addIssue({
          code: 'custom',
          path: ['milestones'],
          message: 'Thresholds must be strictly increasing',
        });
      }
      if (value.milestones[index].payout < value.milestones[index - 1].payout) {
        context.addIssue({
          code: 'custom',
          path: ['milestones'],
          message: 'Payouts must be non-decreasing',
        });
      }
    }
  });

export type CampaignInput = z.infer<typeof campaignSchema>;

export function normalizeCampaignName(value: string) {
  return value.trim().toLowerCase();
}
