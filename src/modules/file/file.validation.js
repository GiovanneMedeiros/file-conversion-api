import { z } from 'zod';

export const uploadHeadersSchema = z.object({
  authorization: z.string().min(1, 'authorization header is required'),
  'content-type': z
    .string()
    .refine((value) => /multipart\/form-data/i.test(value), {
      message: 'content-type must be multipart/form-data',
    }),
}).passthrough();
