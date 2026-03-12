import { useState } from 'react';
import { CheckCircle2, Clock3, FileUp } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import FileUploader from '../components/File/FileUploader';
import ConversionForm from '../components/Conversion/ConversionForm';
import ConversionStatus from '../components/Conversion/ConversionStatus';
import { Alert } from '../components/Common';

const STEP_ITEMS = [
  {
    key: 'upload',
    title: 'Upload',
    description: 'Selecione e envie um arquivo compatível.',
    icon: FileUp,
  },
  {
    key: 'convert',
    title: 'Conversão',
    description: 'Escolha o formato de destino.',
    icon: Clock3,
  },
  {
    key: 'download',
    title: 'Download',
    description: 'Baixe o arquivo assim que ficar pronto.',
    icon: CheckCircle2,
  },
];

export const ConvertPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeConversionId, setActiveConversionId] = useState(null);

  const stepStates = {
    upload: !!selectedFile,
    convert: !!activeConversionId,
    download: !!activeConversionId,
  };

  const handleFileUploaded = (file) => {
    setSelectedFile(file);
    setActiveConversionId(null);
  };

  const handleConversionRequested = (conversion) => {
    setActiveConversionId(conversion.id);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Converter Arquivo</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Envie um arquivo e escolha o formato de destino
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {STEP_ITEMS.map((step, index) => {
            const Icon = step.icon;
            const isActive = stepStates[step.key];

            return (
              <div
                key={step.key}
                className={`rounded-lg border p-4 transition-colors ${
                  isActive
                    ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      isActive
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Etapa {index + 1}
                    </p>
                    <p className="font-medium">{step.title}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
              </div>
            );
          })}
        </div>

        {selectedFile && !activeConversionId && (
          <Alert
            type="success"
            title="Upload concluído"
            message="Arquivo recebido pelo backend. Agora escolha o formato de destino para solicitar a conversão."
          />
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">1. Selecionar Arquivo</h2>
            <FileUploader onFileUploaded={handleFileUploaded} />
          </div>

          {/* Conversion Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">2. Escolher Formato</h2>
            {selectedFile ? (
              <ConversionForm
                fileId={selectedFile.id}
                fileName={selectedFile.filename}
                onConversionRequested={handleConversionRequested}
              />
            ) : (
              <Alert type="info" message="Envie um arquivo primeiro" />
            )}
          </div>
        </div>

        {/* Status Section */}
        {activeConversionId && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">3. Acompanhar Status</h2>
            <ConversionStatus conversionId={activeConversionId} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ConvertPage;
