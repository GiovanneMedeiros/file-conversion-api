import { useRef, useState } from 'react';
import { CheckCircle2, Upload, X } from 'lucide-react';
import clsx from 'clsx';
import { Button, Alert } from '../Common';
import useFileUpload from '../../hooks/useFile';

const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const FileUploader = ({ onFileUploaded }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const { mutate: uploadFile, isPending } = useFileUpload();

  const validateFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();

    if (!SUPPORTED_FORMATS.includes(ext)) {
      setError(`Formato não suportado. Use: ${SUPPORTED_FORMATS.join(', ')}`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Arquivo muito grande (máximo 20MB)');
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileSelect = (file) => {
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }

    // Permite selecionar novamente o mesmo arquivo em seguida.
    e.target.value = '';
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadFile(selectedFile, {
        onSuccess: (data) => {
          setSelectedFile(null);
          onFileUploaded(data.file);
        },
      });
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={clsx(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer',
          'transition-colors duration-200',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED_FORMATS.map((f) => `.${f}`).join(',')}
          onChange={handleInputChange}
          className="hidden"
        />

        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-lg font-medium mb-1">Arraste arquivos aqui</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ou clique para selecionar
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          Formatos: JPG, JPEG, PNG | Máximo: 20MB
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      {selectedFile && (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{selectedFile.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Arquivo pronto para envio • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {selectedFile && (
        <Button
           type="button"
           onClick={handleUpload}
           loading={isPending}
           className="w-full"
        >
          Enviar Arquivo
        </Button>
      )}
    </div>
  );
};

export default FileUploader;
