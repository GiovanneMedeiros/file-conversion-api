import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../database/prismaClient.js';
import { conflict, unauthorized } from '../../shared/errors/httpError.js';
import { jwtConfig } from '../../shared/security/jwt.js';

const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials';

function getSaltRounds() {
  const value = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  if (!Number.isInteger(value) || value < 10 || value > 14) {
    return 10;
  }

  return value;
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function normalizeName(name) {
  return name.trim();
}

export async function registerUser({ name, email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedName = normalizeName(name);

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw conflict('Email already in use');
  }

  const hashedPassword = await bcrypt.hash(password, getSaltRounds());

  const user = await prisma.user.create({
    data: {
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return user;
}

export async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    throw unauthorized(INVALID_CREDENTIALS_MESSAGE);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw unauthorized(INVALID_CREDENTIALS_MESSAGE);
  }

  const token = jwt.sign({ userId: user.id }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
    algorithm: jwtConfig.algorithm,
  });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
}
