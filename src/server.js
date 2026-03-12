import 'dotenv/config';
import fs from 'fs';
import app from './app.js';
import prisma from './database/prismaClient.js';
import logger from './shared/utils/logger.js';
import { assertJwtConfig } from './shared/security/jwt.js';

const PORT = Number(process.env.PORT || 3000);

for (const dir of ['uploads', 'converted']) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function startServer() {
  try {
    assertJwtConfig();
    await prisma.$connect();
    app.listen(PORT, () => {
      logger.info(`Convertly API running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { message: error.message, stack: error.stack });
    process.exit(1);
  }
}

startServer();
