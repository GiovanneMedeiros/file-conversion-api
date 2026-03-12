import { Queue } from 'bullmq';
import logger from '../shared/utils/logger.js';

export const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
  connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 5000),
  maxRetriesPerRequest: null,
  enableOfflineQueue: true,
};

let conversionQueue;

export function getConversionQueue() {
  if (!conversionQueue) {
    conversionQueue = new Queue('conversion-queue', {
      connection: redisConnection,
    });

    conversionQueue.on('error', (error) => {
      logger.error('Conversion queue connection error', { message: error.message });
    });
  }

  return conversionQueue;
}
