import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import conversionService from '../services/conversion.service';
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

export const useRequestConversion = () => {
  const addNotification = useNotificationStore((state) => state.addNotification);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, targetFormat }) =>
      conversionService.requestConversion(fileId, targetFormat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversions', 'history'] });
      addNotification({
        type: 'success',
        message: 'Conversão solicitada! Acompanhando status...',
      });
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, 'Erro ao solicitar conversão');
      addNotification({
        type: 'error',
        message: message,
        duration: 5000,
      });
    },
  });
};

export const useConversionStatus = (conversionId, enabled = true) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['conversion', conversionId],
    queryFn: () => conversionService.getConversionStatus(conversionId),
    enabled: !!conversionId && enabled,
    refetchInterval: (query) => {
      // Em React Query v5, o callback recebe o objeto query.
      const status = query?.state?.data?.status;
      if (status === 'pending' || status === 'processing') {
        return 2000;
      }

      // Não refaz quando finalizou (completed/failed) ou ainda não há dados.
      return false;
    },
  });

  useEffect(() => {
    const status = query.data?.status;
    if (status === 'completed' || status === 'failed') {
      queryClient.invalidateQueries({ queryKey: ['conversions', 'history'] });
    }
  }, [query.data?.status, queryClient]);

  return query;
};

export const useUserConversions = () => {
  return useQuery({
    queryKey: ['conversions', 'history'],
    queryFn: () => conversionService.getUserConversions(),
    staleTime: 30000, // 30 segundos
    refetchInterval: (query) => {
      const hasRunningConversions = (query?.state?.data || []).some(
        (conversion) => conversion.status === 'pending' || conversion.status === 'processing'
      );

      return hasRunningConversions ? 4000 : false;
    },
  });
};

export const useDownloadConvertedFile = () => {
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation({
    mutationFn: (filename) => conversionService.downloadConvertedFile(filename),
    onSuccess: (blob, filename) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addNotification({
        type: 'success',
        message: 'Download iniciado!',
      });
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, 'Erro ao baixar arquivo');
      addNotification({
        type: 'error',
        message: message,
        duration: 5000,
      });
    },
  });
};

export default { useRequestConversion, useConversionStatus, useUserConversions, useDownloadConvertedFile };
