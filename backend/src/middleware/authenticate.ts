import type { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import type { AuthedRequest } from '../shared/types/express';

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    req.user = jwt.verify(token, config.jwtSecret) as AuthedRequest['user'];
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired session' });
  }
}
