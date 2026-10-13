import { Router } from 'express';
import { requireAuth } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import { asyncHandler } from '../../shared/http/async-handler';
import { create, live, mine } from './campaign.controller';
import { campaignSchema } from './campaign.validation';

export const campaignRouter = Router();

campaignRouter.post('/', requireAuth, requireRole('brand'), validateBody(campaignSchema), asyncHandler(create));
campaignRouter.get('/mine', requireAuth, requireRole('brand'), asyncHandler(mine));
campaignRouter.get('/live', requireAuth, requireRole('creator'), asyncHandler(live));
