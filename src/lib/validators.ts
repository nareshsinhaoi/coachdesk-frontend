import { z } from 'zod';

export const emailSchema = z.string().email('Enter a valid email');
export const phoneSchema = z.string().min(10, 'Enter a valid phone').max(15);
export const passwordSchema = z.string().min(8, 'Minimum 8 characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});
export type LoginValues = z.infer<typeof loginSchema>;