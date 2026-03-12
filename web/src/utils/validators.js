import { SUPPORTED_UPLOAD_FORMATS, MAX_FILE_SIZE } from './constants';

export const validateFileForUpload = (file) => {
  const ext = file.name.split('.').pop().toLowerCase();

  if (!SUPPORTED_UPLOAD_FORMATS.includes(ext)) {
    return {
      valid: false,
      error: `Formato não suportado. Use: ${SUPPORTED_UPLOAD_FORMATS.join(', ')}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Arquivo muito grande (máximo 20MB)',
    };
  }

  return { valid: true };
};

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateName = (name) => {
  return name.trim().length >= 2;
};
