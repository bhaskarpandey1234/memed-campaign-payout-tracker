import { Router } from 'express';
import { requireAuth } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import { asyncHandler } from '../../shared/http/async-handler';
import { create, updateViews } from './submission.controller';
import { submissionSchema, viewsSchema } from './submission.validation';

export const submissionRouter = Router();
submissionRouter.post('/campaigns/:id/submissions', requireAuth, requireRole('creator'), validateBody(submissionSchema), asyncHandler(create));
submissionRouter.patch('/submissions/:id/views', validateBody(viewsSchema), asyncHandler(updateViews));
