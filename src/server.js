import 'dotenv/config';
import fs from 'fs';
import app from './app.js';
import prisma from './database/prismaClient.js';
import logger from './shared/utils/logger.js';
import { assertJwtConfig } from './shared/security/jwt.js';

const PORT = Number(process.env.PORT || 3000);
const HOST = '0.0.0.0';

async function startServer() {
  try {
    assertJwtConfig();
    await prisma.$connect();

    app.listen(PORT, HOST, () => {
      logger.info(`Convertly API running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

startServer();
