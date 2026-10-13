import bcrypt from 'bcryptjs';
import { User } from './auth.model';
import type { AuthUser } from './auth.types';
import type { LoginInput, SignupInput } from './auth.validation';
import { AppError } from '../../shared/errors/app-error';

function asAuthUser(user: { id?: string; _id: { toString(): string }; email: string; role: AuthUser['role'] }): AuthUser {
  return { id: user.id || user._id.toString(), email: user.email, role: user.role };
}

export async function signup(input: SignupInput): Promise<AuthUser> {
  if (await User.exists({ email: input.email.toLowerCase() })) {
    throw new AppError(409, 'Email is already registered');
  }

  const user = await User.create({
    email: input.email,
    passwordHash: await bcrypt.hash(input.password, 12),
    role: input.role,
  });
  return asAuthUser(user);
}

export async function login(input: LoginInput): Promise<AuthUser | null> {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    return null;
  }
  return asAuthUser(user);
}
