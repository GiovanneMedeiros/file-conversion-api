export const jwtConfig = {
  secret: process.env.JWT_SECRET || '',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  issuer: process.env.JWT_ISSUER || 'convertly-api',
  audience: process.env.JWT_AUDIENCE || 'convertly-clients',
  algorithm: 'HS256',
};

export function assertJwtConfig() {
  if (!jwtConfig.secret || jwtConfig.secret.length < 16) {
    throw new Error('JWT_SECRET must be set and have at least 16 characters');
  }
}
