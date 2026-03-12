import { z } from 'zod';

export const registerBodySchema = z.object({
  name: z.string().trim().min(2, 'name must have at least 2 characters'),
  email: z.string().trim().email('email must be a valid email address'),
  password: z.string().min(6, 'password must have at least 6 characters'),
});

export const loginBodySchema = z.object({
  email: z.string().trim().email('email must be a valid email address'),
  password: z.string().min(6, 'password must have at least 6 characters'),
});
