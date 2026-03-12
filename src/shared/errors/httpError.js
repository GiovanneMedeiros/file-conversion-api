export class HttpError extends Error {
  constructor(message, statusCode, code, details) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function createHttpError({ message, statusCode, code, details }) {
  return new HttpError(message, statusCode, code, details);
}

export function badRequest(message, details) {
  return createHttpError({ message, statusCode: 400, code: 'BAD_REQUEST', details });
}

export function unauthorized(message = 'Access denied. Missing token.') {
  return createHttpError({ message, statusCode: 401, code: 'UNAUTHORIZED' });
}

export function forbidden(message = 'Forbidden') {
  return createHttpError({ message, statusCode: 403, code: 'FORBIDDEN' });
}

export function notFound(message = 'Resource not found') {
  return createHttpError({ message, statusCode: 404, code: 'NOT_FOUND' });
}

export function conflict(message = 'Conflict') {
  return createHttpError({ message, statusCode: 409, code: 'CONFLICT' });
}

export function serviceUnavailable(message = 'Service unavailable') {
  return createHttpError({
    message,
    statusCode: 503,
    code: 'SERVICE_UNAVAILABLE',
  });
}
