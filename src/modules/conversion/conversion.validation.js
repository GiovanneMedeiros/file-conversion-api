import { z } from 'zod';

export const supportedTargetFormats = ['png', 'jpg', 'jpeg', 'webp', 'pdf'];

export const createConversionBodySchema = z.object({
  fileId: z.string().trim().min(1, 'fileId is required'),
  targetFormat: z
    .string()
    .trim()
    .toLowerCase()
    .refine((value) => supportedTargetFormats.includes(value), {
      message: `targetFormat must be one of: ${supportedTargetFormats.join(', ')}`,
    }),
});

export const conversionIdParamsSchema = z.object({
  id: z.string().trim().min(1, 'id param is required'),
});

export const downloadParamsSchema = z.object({
  filename: z
    .string()
    .trim()
    .min(1, 'filename param is required')
    .regex(/^[a-zA-Z0-9._-]+$/, 'filename contains invalid characters'),
});

export const conversionsHistoryQuerySchema = z.object({}).passthrough();
