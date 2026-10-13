export type Role = 'brand' | 'creator';

export interface User {
  id: string;
  email: string;
  role: Role;
}
