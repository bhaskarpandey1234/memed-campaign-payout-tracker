export type Role = 'brand' | 'creator';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}
