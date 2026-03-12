import { useMutation } from '@tanstack/react-query';
import fileService from '../services/file.service';
import { useNotificationStore } from '../store/notificationStore';

function getApiErrorMessage(error, fallbackMessage) {
  const apiError = error.response?.data?.error;
  const apiDetails = error.response?.data?.details;

  if (Array.isArray(apiDetails) && apiDetails.length > 0) {
    return `${apiError || fallbackMessage}: ${apiDetails.map((detail) => detail.message).join(', ')}`;
  }

  if (typeof apiDetails === 'string' && apiDetails.trim()) {
    return `${apiError || fallbackMessage}: ${apiDetails}`;
  }

  return apiError || fallbackMessage;
}

export const useFileUpload = () => {
  const addNotification = useNotificationStore((state) => state.addNotification);

  const mutation = useMutation({
    mutationFn: (file) => fileService.uploadFile(file),
    onSuccess: (data) => {
      addNotification({
        type: 'success',
        message: 'Arquivo enviado com sucesso!',
      });
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, 'Erro ao enviar arquivo');
      addNotification({
        type: 'error',
        message: message,
        duration: 5000,
      });
    },
  });

  return mutation;
};

export default useFileUpload;
