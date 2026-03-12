import fs from 'fs/promises';
import net from 'net';
import path from 'path';
import prisma from '../../database/prismaClient.js';
import { getConversionQueue, redisConnection } from '../../queue/conversion.queue.js';
import logger from '../../shared/utils/logger.js';
import { badRequest, notFound, serviceUnavailable } from '../../shared/errors/httpError.js';

const SUPPORTED_SOURCE_FORMATS = new Set(['jpg', 'jpeg', 'png']);

function isRedisReachable(host, port, timeoutMs = 900) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port: Number(port) });
    let settled = false;

    const finish = (result) => {
      if (settled) {
        return;
      }
      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(timeoutMs);
    socket.on('connect', () => finish(true));
    socket.on('error', () => finish(false));
    socket.on('timeout', () => finish(false));
  });
}

export async function requestConversion({ userId, fileId, targetFormat }) {
  const isRedisAvailable = await isRedisReachable(redisConnection.host, redisConnection.port);
  if (!isRedisAvailable) {
    logger.error('Redis unavailable for conversion request', {
      redisHost: redisConnection.host,
      redisPort: redisConnection.port,
    });

    throw serviceUnavailable('Conversion queue is unavailable. Start Redis and try again.');
  }

  const file = await prisma.file.findFirst({
    where: { id: fileId, userId },
  });

  if (!file) {
    throw notFound('File not found');
  }

  if (!SUPPORTED_SOURCE_FORMATS.has(file.originalFormat)) {
    throw badRequest('Source file format is not supported for conversion', {
      supportedSourceFormats: Array.from(SUPPORTED_SOURCE_FORMATS),
      received: file.originalFormat,
    });
  }

  const conversion = await prisma.conversion.create({
    data: {
      userId,
      fileId,
      targetFormat: targetFormat.toLowerCase(),
      status: 'pending',
    },
  });

  try {
    await getConversionQueue().add('convert-file', {
      conversionId: conversion.id,
    });
  } catch (error) {
    logger.error('Failed to enqueue conversion job', {
      conversionId: conversion.id,
      message: error.message,
    });

    await prisma.conversion.update({
      where: { id: conversion.id },
      data: { status: 'failed' },
    });

    throw serviceUnavailable('Conversion queue is unavailable. Start Redis and try again.');
  }

  return conversion;
}

export async function getConversionStatus({ userId, conversionId }) {
  const conversion = await prisma.conversion.findFirst({
    where: { id: conversionId, userId },
    select: { id: true, status: true, resultFile: true, createdAt: true },
  });

  if (!conversion) {
    throw notFound('Conversion not found');
  }

  return conversion;
}

export async function getUserConversionHistory(userId) {
  return prisma.conversion.findMany({
    where: { userId },
    include: { file: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDownloadPath({ userId, filename }) {
  const conversion = await prisma.conversion.findFirst({
    where: { userId, resultFile: filename, status: 'completed' },
  });

  if (!conversion) {
    throw notFound('Converted file not found');
  }

  const filePath = path.resolve('converted', filename);

  try {
    await fs.access(filePath);
  } catch {
    throw notFound('File does not exist on disk');
  }

  return filePath;
}
