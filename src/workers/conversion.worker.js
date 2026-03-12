import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { Worker } from 'bullmq';
import prisma from '../database/prismaClient.js';
import { redisConnection } from '../queue/conversion.queue.js';
import logger from '../shared/utils/logger.js';

async function processConversion(conversionId) {
  const conversion = await prisma.conversion.findUnique({
    where: { id: conversionId },
    include: { file: true },
  });

  if (!conversion) {
    throw new Error('Conversion job has invalid id');
  }

  await prisma.conversion.update({
    where: { id: conversionId },
    data: { status: 'processing' },
  });

  const inputPath = path.resolve('uploads', conversion.file.filename);
  const outputFilename = `${conversion.id}.${conversion.targetFormat}`;
  const outputPath = path.resolve('converted', outputFilename);

  const target = conversion.targetFormat.toLowerCase();

  if (['jpg', 'jpeg', 'png', 'webp'].includes(target)) {
    await sharp(inputPath).toFormat(target === 'jpg' ? 'jpeg' : target).toFile(outputPath);
  } else if (target === 'pdf') {
    const bytes = await fs.readFile(inputPath);
    const pdf = await PDFDocument.create();

    const isPng = conversion.file.originalFormat.toLowerCase() === 'png';
    const image = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);

    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });

    const pdfBytes = await pdf.save();
    await fs.writeFile(outputPath, pdfBytes);
  } else {
    throw new Error(`Unsupported target format: ${target}`);
  }

  await prisma.conversion.update({
    where: { id: conversionId },
    data: {
      status: 'completed',
      resultFile: outputFilename,
    },
  });
}

const worker = new Worker(
  'conversion-queue',
  async (job) => {
    logger.info('Conversion job started', {
      jobId: job.id,
      conversionId: job.data?.conversionId,
    });

    try {
      await processConversion(job.data.conversionId);
    } catch (error) {
      await prisma.conversion.update({
        where: { id: job.data.conversionId },
        data: { status: 'failed' },
      });
      throw error;
    }
  },
  { connection: redisConnection },
);

worker.on('completed', (job) =>
  logger.info('Conversion job completed', {
    jobId: job?.id,
    conversionId: job?.data?.conversionId,
  }),
);
worker.on('failed', (job, err) =>
  logger.error('Conversion job failed', {
    jobId: job?.id,
    conversionId: job?.data?.conversionId,
    error: err.message,
  }),
);
worker.on('error', (err) => {
  logger.error('Conversion worker connection error', { message: err.message });
});
