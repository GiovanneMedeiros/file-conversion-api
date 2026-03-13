import { CheckCircle, Clock, AlertCircle, Download, Loader } from 'lucide-react';
import { Button } from '../Common';
import { useDownloadConvertedFile } from '../../hooks/useConversion';

export const ConversionCard = ({ conversion }) => {
  const { mutate: downloadFile, isPending } = useDownloadConvertedFile();

  const getStatusIcon = (status) => {
    const icons = {
      completed: <CheckCircle className="w-5 h-5 text-green-600" />,
      processing: <Loader className="w-5 h-5 text-blue-600 animate-spin" />,
      pending: <Clock className="w-5 h-5 text-yellow-600" />,
      failed: <AlertCircle className="w-5 h-5 text-red-600" />,
    };
    return icons[status] || icons.pending;
  };

  const getStatusLabel = (status) => {
    const labels = {
      completed: 'Concluído',
      processing: 'Processando',
      pending: 'Iniciando',
      failed: 'Falhou',
    };
    return labels[status] || status;
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="font-medium truncate">{conversion.file?.filename}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Arquivo de origem
          </p>
        </div>
        <div className="flex items-center gap-2 ml-3">
          {getStatusIcon(conversion.status)}
          <span className="text-sm font-medium">{getStatusLabel(conversion.status)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div>
          <p className="text-gray-600 dark:text-gray-400">Formato original</p>
          <p className="font-medium">{conversion.file?.originalFormat?.toUpperCase()}</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Formato destino</p>
          <p className="font-medium">{conversion.targetFormat?.toUpperCase()}</p>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {new Date(conversion.createdAt).toLocaleString('pt-BR')}
      </p>

      {conversion.status === 'completed' && conversion.resultFile && (
        <Button
          onClick={() => downloadFile(conversion.resultFile)}
          loading={isPending}
          variant="primary"
          size="sm"
          className="w-full"
        >
          <Download className="w-4 h-4" />
          Baixar
        </Button>
      )}
    </div>
  );
};

export default ConversionCard;
