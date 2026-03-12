import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Alert } from '../Common';
import { useRequestConversion } from '../../hooks/useConversion';

const SUPPORTED_FORMATS = ['png', 'jpg', 'jpeg', 'webp', 'pdf'];

const conversionSchema = z.object({
  targetFormat: z
    .string()
    .refine((value) => SUPPORTED_FORMATS.includes(value), {
      message: 'Formato de destino inválido',
    }),
});

export const ConversionForm = ({ fileId, fileName, onConversionRequested }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(conversionSchema),
    defaultValues: { targetFormat: 'png' },
  });

  const { mutate: requestConversion, isPending } = useRequestConversion();

  const onSubmit = (data) => {
    requestConversion(
      { fileId, targetFormat: data.targetFormat },
      {
        onSuccess: (response) => {
          reset();
          onConversionRequested(response.conversion);
        },
      }
    );
  };

  if (!fileId) {
    return (
      <Alert type="info" message="Selecione um arquivo primeiro" />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Arquivo selecionado
        </p>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
          <p className="font-medium truncate">{fileName}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Formato de destino
        </label>
        <select
          {...register('targetFormat')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        >
          {SUPPORTED_FORMATS.map((format) => (
            <option key={format} value={format}>
              {format.toUpperCase()}
            </option>
          ))}
        </select>
        {errors.targetFormat && (
          <p className="text-red-500 text-sm mt-1">{errors.targetFormat.message}</p>
        )}
      </div>

      <Button
        type="submit"
        loading={isPending}
        className="w-full"
      >
        Solicitar Conversão
      </Button>
    </form>
  );
};

export default ConversionForm;
