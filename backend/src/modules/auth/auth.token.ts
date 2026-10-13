import type { Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import type { AuthUser } from './auth.types';

export function signToken(user: AuthUser) {
  return jwt.sign(user, config.jwtSecret, { expiresIn: '7d' });
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    secure: config.nodeEnv === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}
