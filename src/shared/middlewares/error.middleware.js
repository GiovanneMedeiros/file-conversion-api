import multer from 'multer';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import logger from '../utils/logger.js';
import { sendError } from '../http/response.js';

export function errorMiddleware(err, req, res, next) {
  logger.error('Request error', {
    path: req.path,
    method: req.method,
    message: err.message,
    code: err.code,
    stack: err.stack,
  });

  if (err instanceof ZodError) {
    const validationDetails = err.issues.map((issue) => ({
      field: issue.path.join('.') || 'request',
      message: issue.message,
      code: issue.code,
    }));

    return sendError(res, 400, 'Validation error', {
      code: 'VALIDATION_ERROR',
      details: validationDetails,
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 400, 'Invalid JSON body', {
      code: 'INVALID_JSON',
    });
  }

  if (err instanceof multer.MulterError) {
    return sendError(res, 400, 'File upload error', {
      code: 'FILE_UPLOAD_ERROR',
      details: err.message,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return sendError(res, 400, 'Database error', {
      code: err.code || 'DATABASE_ERROR',
      details: err.message,
    });
  }

  if (err.statusCode) {
    return sendError(res, err.statusCode, err.message, {
      code: err.code,
      details: err.details,
    });
  }

  if (err.name === 'BullMQError' || /redis|queue|bull/i.test(err.message || '')) {
    return sendError(res, 503, 'Queue service unavailable', {
      code: 'QUEUE_UNAVAILABLE',
      details: err.message,
    });
  }

  return sendError(res, 500, 'Internal server error', {
    code: 'INTERNAL_SERVER_ERROR',
  });
}
