import api from './api';

export const conversionService = {
  requestConversion: async (fileId, targetFormat) => {
    const response = await api.post('/conversions', {
      fileId,
      targetFormat,
    });
    return response.data;
  },

  getConversionStatus: async (conversionId) => {
    const response = await api.get(`/conversions/${conversionId}`);
    return response.data;
  },

  getUserConversions: async () => {
    const response = await api.get('/users/conversions');
    return response.data;
  },

  downloadConvertedFile: async (filename) => {
    const response = await api.get(`/downloads/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default conversionService;
