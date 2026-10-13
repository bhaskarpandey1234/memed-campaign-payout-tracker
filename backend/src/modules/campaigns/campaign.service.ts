import { AppError } from '../../shared/errors/app-error';
import { Campaign } from './campaign.model';
import { normalizeCampaignName, type CampaignInput } from './campaign.validation';

function withRemainingBudget(campaign: { totalBudget: number; spent: number }) {
  return { ...campaign, remainingBudget: campaign.totalBudget - campaign.spent };
}

export async function createCampaign(
  brandId: string,
  input: CampaignInput,
  idempotencyKey?: string,
) {
  const normalizedName = normalizeCampaignName(input.name);

  if (idempotencyKey) {
    const existing = await Campaign.findOne({ brand: brandId, idempotencyKey });
    if (existing) {
      return { campaign: existing, reused: true };
    }
  }

  const duplicate = await Campaign.findOne({
    brand: brandId,
    platform: input.platform,
    normalizedName,
  });
  if (duplicate) {
    throw new AppError(409, 'You already have a campaign with this name on this platform');
  }

  try {
    const campaign = await Campaign.create({
      ...input,
      normalizedName,
      brand: brandId,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    });
    return { campaign, reused: false };
  } catch (error) {
    if ((error as { code?: number })?.code === 11000) {
      if (idempotencyKey) {
        const existing = await Campaign.findOne({ brand: brandId, idempotencyKey });
        if (existing) {
          return { campaign: existing, reused: true };
        }
      }
      const existing = await Campaign.findOne({
        brand: brandId,
        platform: input.platform,
        normalizedName,
      });
      if (existing) {
        throw new AppError(409, 'You already have a campaign with this name on this platform');
      }
    }
    throw error;
  }
}

export async function getBrandCampaigns(brandId: string) {
  const campaigns = await Campaign.find({ brand: brandId }).sort({ createdAt: -1 }).lean();
  return campaigns.map(withRemainingBudget);
}

export async function getLiveCampaigns() {
  const campaigns = await Campaign.find({
    status: 'active',
    $expr: { $lt: ['$spent', '$totalBudget'] },
  })
    .sort({ createdAt: -1 })
    .lean();
  return campaigns.map(withRemainingBudget);
}
