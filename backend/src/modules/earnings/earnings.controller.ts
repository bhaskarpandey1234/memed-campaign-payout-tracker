import type { RequestHandler } from 'express';
import type { AuthedRequest } from '../../shared/types/express';
import { getCreatorEarnings } from './earnings.service';

export const mine: RequestHandler = async (req, res) => {
  res.json(await getCreatorEarnings((req as AuthedRequest).user!.id));
};
