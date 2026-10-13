import { Router } from 'express';
import { requireAuth } from '../../middleware/authenticate';
import { validateBody } from '../../middleware/validate';
import { asyncHandler } from '../../shared/http/async-handler';
import { login, logout, me, signup } from './auth.controller';
import { loginSchema, signupSchema } from './auth.validation';

export const authRouter = Router();

authRouter.post('/signup', validateBody(signupSchema), asyncHandler(signup));
authRouter.post('/login', validateBody(loginSchema), asyncHandler(login));
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);
