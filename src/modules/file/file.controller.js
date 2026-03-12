import multer from 'multer';
import path from 'path';
import { saveUploadedFileMetadata } from './file.service.js';
import { badRequest } from '../../shared/errors/httpError.js';
import { sendSuccess } from '../../shared/http/response.js';

const SUPPORTED_UPLOAD_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const SUPPORTED_UPLOAD_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve('uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const mimeType = (file.mimetype || '').toLowerCase();

    if (!SUPPORTED_UPLOAD_EXTENSIONS.has(extension) || !SUPPORTED_UPLOAD_MIME_TYPES.has(mimeType)) {
      return callback(
        badRequest(
          'Unsupported file type. Allowed formats: jpg, jpeg, png',
          {
            receivedExtension: extension || 'none',
            receivedMimeType: mimeType || 'none',
          },
        ),
      );
    }

    return callback(null, true);
  },
});

export async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      throw badRequest('File is required');
    }

    const savedFile = await saveUploadedFileMetadata({
      userId: req.user.id,
      file: req.file,
    });

    return sendSuccess(res, 201, {
      message: 'File uploaded successfully',
      file: savedFile,
    });
  } catch (error) {
    return next(error);
  }
}
