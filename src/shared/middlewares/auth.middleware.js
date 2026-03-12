import jwt from 'jsonwebtoken';
import { sendError } from '../http/response.js';
import { jwtConfig } from '../security/jwt.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return sendError(res, 401, 'Access denied. Missing token.', {
      code: 'UNAUTHORIZED',
    });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Authorization header must use Bearer token.', {
      code: 'UNAUTHORIZED',
    });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  if (token.length > 4096) {
    return sendError(res, 401, 'Invalid token.', {
      code: 'UNAUTHORIZED',
    });
  }

  if (!token) {
    return sendError(res, 401, 'Access denied. Missing token.', {
      code: 'UNAUTHORIZED',
    });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret, {
      algorithms: [jwtConfig.algorithm],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    });

    if (!decoded || typeof decoded !== 'object' || typeof decoded.userId !== 'string') {
      return sendError(res, 401, 'Invalid token payload.', {
        code: 'UNAUTHORIZED',
      });
    }

    req.user = { id: decoded.userId };
    return next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired token.', {
      code: 'UNAUTHORIZED',
    });
  }
}
