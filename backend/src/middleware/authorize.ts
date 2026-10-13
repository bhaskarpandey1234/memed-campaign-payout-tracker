import type { NextFunction, Response } from 'express';
import type { Role } from '../modules/auth/auth.types';
import type { AuthedRequest } from '../shared/types/express';

export function requireRole(role: Role) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (req.user?.role === role) {
      next();
      return;
    }
    res.status(403).json({ message: `${role} role required` });
  };
}
