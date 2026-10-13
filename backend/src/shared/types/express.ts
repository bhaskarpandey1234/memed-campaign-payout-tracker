import type { Request } from 'express';
import type { AuthUser } from '../../modules/auth/auth.types';

export type AuthedRequest = Request & { user?: AuthUser };
