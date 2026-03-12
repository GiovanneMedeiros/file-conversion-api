import rateLimit from 'express-rate-limit';
import { sendError } from '../http/response.js';

function buildHandler(message) {
  return (req, res) =>
    sendError(res, 429, message, {
      code: 'TOO_MANY_REQUESTS',
    });
}

export const authRateLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 50),
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildHandler('Too many authentication attempts. Please try again later.'),
});

export const apiRateLimiter = rateLimit({
  windowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.API_RATE_LIMIT_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildHandler('Too many requests. Please try again later.'),
});
