export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;

export const SUPPORTED_FORMATS = ['png', 'jpg', 'jpeg', 'webp', 'pdf'];
export const SUPPORTED_UPLOAD_FORMATS = ['jpg', 'jpeg', 'png'];
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const CONVERSION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};
