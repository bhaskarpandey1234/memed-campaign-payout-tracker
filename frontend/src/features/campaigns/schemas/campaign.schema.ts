import { z } from 'zod';

const rupeeAmount = z.string().trim().regex(/^\d+(?:\.\d{1,2})?$/, 'Enter a valid rupee amount.');
const positiveViews = z.string().trim().regex(/^[1-9]\d*$/, 'Use a positive whole number of views.');

export const campaignFormSchema = z.object({
  name: z.string().trim().min(1, 'Give this campaign a name.').max(120, 'Campaign names can be up to 120 characters.'),
  platform: z.enum(['Instagram', 'YouTube']),
  budget: rupeeAmount.refine((value) => Number(value) > 0, 'Budget must be greater than ₹0.'),
  milestones: z.array(z.object({ threshold: positiveViews, payout: rupeeAmount })).min(1, 'Add at least one milestone.'),
}).superRefine((value, context) => {
  value.milestones.forEach((milestone, index) => {
    if (Number(milestone.payout) < 0) context.addIssue({ code: 'custom', path: ['milestones', index, 'payout'], message: 'Payout cannot be negative.' });
    if (index === 0) return;
    const previous = value.milestones[index - 1];
    if (Number(milestone.threshold) <= Number(previous.threshold)) context.addIssue({ code: 'custom', path: ['milestones', index, 'threshold'], message: 'Views must increase.' });
    if (Number(milestone.payout) < Number(previous.payout)) context.addIssue({ code: 'custom', path: ['milestones', index, 'payout'], message: 'Payout cannot decrease.' });
  });
});

export type CampaignFormValues = z.infer<typeof campaignFormSchema>;
