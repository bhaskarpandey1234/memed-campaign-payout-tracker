import { z } from 'zod';

export const authSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
  role: z.enum(['brand', 'creator']),
});

export function getAuthSchema(mode: 'login' | 'signup') {
  return mode === 'signup'
    ? authSchema.extend({ password: z.string().min(6, 'Use at least 6 characters.') })
    : authSchema;
}

export type AuthFormValues = z.infer<typeof authSchema>;
