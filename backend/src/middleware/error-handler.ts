import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/app-error';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ message: 'Validation failed', errors: error.flatten() });
    return;
  }

  if ((error as { code?: number })?.code === 11000) {
    res.status(409).json({ message: 'Resource already exists' });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.status).json({ message: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
};
