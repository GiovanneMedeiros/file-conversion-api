import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import prisma from '../../database/prismaClient.js';
import logger from '../../shared/utils/logger.js';

/**
 * Executes the conversion for a given conversionId.
 * Updates the conversion status to processing → completed | failed.
 * Throws on failure (status is already set to 'failed' before throwing).
 */
export async function processConversion(conversionId) {
  const conversion = await prisma.conversion.findUnique({
    where: { id: conversionId },
    include: { file: true },
  });

  if (!conversion) {
    throw new Error(`Conversion not found: ${conversionId}`);
  }

  await prisma.conversion.update({
    where: { id: conversionId },
    data: { status: 'processing' },
  });

  logger.info('Processing conversion', { conversionId });

  const inputPath = path.resolve('uploads', conversion.file.filename);
  const outputFilename = `${conversion.id}.${conversion.targetFormat}`;
  const outputPath = path.resolve('converted', outputFilename);
  const target = conversion.targetFormat.toLowerCase();

  try {
    if (['jpg', 'jpeg', 'png', 'webp'].includes(target)) {
      await sharp(inputPath)
        .toFormat(target === 'jpg' ? 'jpeg' : target)
        .toFile(outputPath);
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
      data: { status: 'completed', resultFile: outputFilename },
    });

    logger.info('Conversion completed', { conversionId, outputFilename });
  } catch (error) {
    await prisma.conversion.update({
      where: { id: conversionId },
      data: { status: 'failed' },
    });

    logger.error('Conversion failed', { conversionId, error: error.message });
    throw error;
  }
}
