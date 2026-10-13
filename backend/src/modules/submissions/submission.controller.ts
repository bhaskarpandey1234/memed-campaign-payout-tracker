import type { RequestHandler } from 'express';
import type { AuthedRequest } from '../../shared/types/express';
import { createSubmission, updateSubmissionViews } from './submission.service';
import type { SubmissionInput, ViewsInput } from './submission.validation';

export const create: RequestHandler = async (req, res) => {
  const submission = await createSubmission(String(req.params.id), (req as AuthedRequest).user!.id, req.body as SubmissionInput);
  res.status(201).json({ submission });
};

export const updateViews: RequestHandler = async (req, res) => {
  res.json(await updateSubmissionViews(String(req.params.id), req.body as ViewsInput));
};
