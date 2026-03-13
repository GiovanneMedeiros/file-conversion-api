import { CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { Button, Loading, Alert } from '../Common';
import { useConversionStatus, useDownloadConvertedFile } from '../../hooks/useConversion';

const STATUS_CONFIG = {
  pending: {
    label: 'Iniciando conversão',
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  processing: {
    label: 'Processando...',
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  completed: {
    label: 'Concluído',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  failed: {
    label: 'Falhou',
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
};

export const ConversionStatus = ({ conversionId }) => {
  const { data: conversion, isLoading, error } = useConversionStatus(conversionId);
  const { mutate: downloadFile, isPending: isDownloading } = useDownloadConvertedFile();

  const errorMessage = error?.response?.data?.error || 'Erro ao buscar status da conversão';
  const errorDetails = error?.response?.data?.details;

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Não foi possível consultar a conversão"
        message={typeof errorDetails === 'string' ? `${errorMessage}: ${errorDetails}` : errorMessage}
      />
    );
  }

  if (!conversion) {
    return null;
  }

  const config = STATUS_CONFIG[conversion.status] || STATUS_CONFIG.processing;
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      <div className={`rounded-lg p-4 ${config.bg}`}>
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${config.color}`} />
          <div>
            <p className="font-medium">{config.label}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ID: {conversionId}
            </p>
          </div>
        </div>
      </div>

      {conversion.status === 'processing' && (
        <Alert
          type="info"
          title="Conversão em andamento"
          message="Processamento em andamento. A página será atualizada automaticamente."
        />
      )}

      {conversion.status === 'pending' && (
        <Alert
          type="info"
          title="Conversão iniciada"
          message="A conversão foi iniciada e o resultado estará disponível em instantes."
        />
      )}

      {conversion.status === 'completed' && (
        <div className="space-y-3">
          <Alert
            type="success"
            title="Conversão concluída"
            message={`Arquivo pronto para download: ${conversion.resultFile}`}
          />
          <Button
            onClick={() => downloadFile(conversion.resultFile)}
            loading={isDownloading}
            className="w-full flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Baixar Arquivo Convertido
          </Button>
        </div>
      )}

      {conversion.status === 'failed' && (
        <Alert
          type="error"
          title="Falha no processamento"
          message="A conversão falhou no backend. Tente enviar novamente ou escolha outro formato de destino."
        />
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Criado em: {new Date(conversion.createdAt).toLocaleString('pt-BR')}
      </div>
    </div>
  );
};

export default ConversionStatus;
