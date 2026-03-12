import { z } from 'zod';

export const uploadHeadersSchema = z.object({
  authorization: z.string().min(1, 'authorization header is required'),
  'content-type': z
    .string()
    .toLowerCase()
    .refine((value) => value.includes('multipart/form-data'), {
      message: 'content-type must be multipart/form-data',
    }),
}).passthrough();
