import mongoose from 'mongoose';
import { Campaign } from '../campaigns/campaign.model';
import type { Platform } from '../campaigns/campaign.types';
import { calculatePayout, capPayout } from '../payouts';
import { AppError } from '../../shared/errors/app-error';
import { Submission } from './submission.model';
import type { SubmissionInput, ViewsInput } from './submission.validation';
import { isPostUrlForPlatform } from './submission.validation';
import type { ViewUpdateResponse } from './submission.types';

export async function createSubmission(campaignId: string, creatorId: string, input: SubmissionInput) {
  const campaign = await Campaign.findOne({ _id: campaignId, status: 'active', $expr: { $lt: ['$spent', '$totalBudget'] } });
  if (!campaign) throw new AppError(404, 'Live campaign not found');
  if (!isPostUrlForPlatform(campaign.platform as Platform, input.postUrl)) {
    throw new AppError(400, `Post URL must belong to ${campaign.platform}`);
  }

  const existing = await Submission.findOne({ campaign: campaign.id, creator: creatorId, postUrl: input.postUrl });
  if (existing) throw new AppError(409, 'This post URL has already been submitted to this campaign');

  try {
    return await Submission.create({ campaign: campaign.id, creator: creatorId, postUrl: input.postUrl, dedupeVersion: 1 });
  } catch (error) {
    if ((error as { code?: number })?.code === 11000) {
      throw new AppError(409, 'This post URL has already been submitted to this campaign');
    }
    throw error;
  }
}

export async function updateSubmissionViews(submissionId: string, input: ViewsInput): Promise<ViewUpdateResponse> {
  const session = await mongoose.startSession();
  let response: ViewUpdateResponse | undefined;
  try {
    await session.withTransaction(async () => {
      const submission = await Submission.findById(submissionId).session(session);
      if (!submission) throw new AppError(404, 'Submission not found');
      if (input.views < submission.views) throw new AppError(400, 'View count cannot decrease');

      const campaign = await Campaign.findById(submission.campaign).session(session);
      if (!campaign) throw new AppError(404, 'Campaign not found');

      const milestones = campaign.milestones.map(({ threshold, payout }) => ({ threshold, payout }));
      const result = calculatePayout(input.views, milestones, submission.creditedPayout);
      const credit = capPayout(result.incrementalPayout, Math.max(0, campaign.totalBudget - campaign.spent));
      submission.views = input.views;
      submission.highestMilestone = result.highestMilestone;
      submission.creditedPayout += credit;
      submission.budgetCapped = credit < result.incrementalPayout;
      campaign.spent += credit;
      if (campaign.spent >= campaign.totalBudget) campaign.status = 'exhausted';
      await submission.save({ session });
      await campaign.save({ session });
      response = { submission, campaign: { id: campaign.id, spent: campaign.spent, remainingBudget: campaign.totalBudget - campaign.spent } };
    });
    return response!;
  } finally {
    await session.endSession();
  }
}
