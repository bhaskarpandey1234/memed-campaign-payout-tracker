import { Router } from 'express';
import { requireAuth } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/authorize';
import { asyncHandler } from '../../shared/http/async-handler';
import { mine } from './earnings.controller';

export const earningsRouter = Router();
earningsRouter.get('/me', requireAuth, requireRole('creator'), asyncHandler(mine));
