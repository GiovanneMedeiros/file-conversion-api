import fs from 'fs/promises';
import path from 'path';
import prisma from '../../database/prismaClient.js';
import { processConversion } from './conversion.processor.js';
import logger from '../../shared/utils/logger.js';
import { badRequest, notFound } from '../../shared/errors/httpError.js';

const SUPPORTED_SOURCE_FORMATS = new Set(['jpg', 'jpeg', 'png']);

export async function requestConversion({ userId, fileId, targetFormat }) {
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

  logger.info('Conversion started', { conversionId: conversion.id, fileId, targetFormat });

  try {
    await processConversion(conversion.id);
  } catch (error) {
    logger.error('Conversion processing failed', {
      conversionId: conversion.id,
      message: error.message,
    });
    // status already set to 'failed' inside processConversion
  }

  return prisma.conversion.findUnique({ where: { id: conversion.id } });
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
