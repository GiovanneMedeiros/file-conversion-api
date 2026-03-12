import path from 'path';
import prisma from '../../database/prismaClient.js';

export async function saveUploadedFileMetadata({ userId, file }) {
  const originalFormat = path.extname(file.originalname).replace('.', '').toLowerCase();

  const created = await prisma.file.create({
    data: {
      userId,
      filename: file.filename,
      originalFormat,
      size: file.size,
    },
  });

  return created;
}
