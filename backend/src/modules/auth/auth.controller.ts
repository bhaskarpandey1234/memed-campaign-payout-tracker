import type { RequestHandler } from 'express';
import type { AuthedRequest } from '../../shared/types/express';
import { login as loginUser, signup as signupUser } from './auth.service';
import { setAuthCookie, signToken } from './auth.token';
import type { LoginInput, SignupInput } from './auth.validation';

export const signup: RequestHandler = async (req, res) => {
  const user = await signupUser(req.body as SignupInput);
  setAuthCookie(res, signToken(user));
  res.status(201).json({ user });
};

export const login: RequestHandler = async (req, res) => {
  const user = await loginUser(req.body as LoginInput);
  if (!user) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }
  setAuthCookie(res, signToken(user));
  res.json({ user });
};

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
};

export const me: RequestHandler = (req, res) => {
  res.json({ user: (req as AuthedRequest).user });
};
