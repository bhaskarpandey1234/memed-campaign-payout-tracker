import { Submission } from '../submissions/submission.model';

export async function getCreatorEarnings(creatorId: string) {
  const submissions = await Submission.find({ creator: creatorId }).populate('campaign', 'name platform').sort({ updatedAt: -1 }).lean();
  return { totalEarnings: submissions.reduce((sum, submission) => sum + submission.creditedPayout, 0), submissions };
}
