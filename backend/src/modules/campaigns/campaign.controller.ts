import type { RequestHandler } from 'express';
import type { AuthedRequest } from '../../shared/types/express';
import { createCampaign, getBrandCampaigns, getLiveCampaigns } from './campaign.service';
import type { CampaignInput } from './campaign.validation';

export const create: RequestHandler = async (req, res) => {
  const idempotencyKey = req.get('Idempotency-Key')?.trim();
  if (idempotencyKey && idempotencyKey.length > 200) {
    res.status(400).json({ message: 'Idempotency-Key is too long' });
    return;
  }

  const result = await createCampaign(
    (req as AuthedRequest).user!.id,
    req.body as CampaignInput,
    idempotencyKey,
  );
  res.status(result.reused ? 200 : 201).json({ campaign: result.campaign });
};

export const mine: RequestHandler = async (req, res) => {
  const campaigns = await getBrandCampaigns((req as AuthedRequest).user!.id);
  res.json({ campaigns });
};

export const live: RequestHandler = async (_req, res) => {
  const campaigns = await getLiveCampaigns();
  res.json({ campaigns });
};
