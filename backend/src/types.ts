import { Request } from 'express';
export type Role = 'brand' | 'creator';
export interface AuthUser { id: string; email: string; role: Role; }
export type AuthedRequest = Request & { user?: AuthUser };
