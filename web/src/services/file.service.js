import api from './api';

export const fileService = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/files/upload', formData);
    return response.data;
  },
};

export default fileService;
