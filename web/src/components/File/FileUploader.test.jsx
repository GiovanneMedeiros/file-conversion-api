import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import FileUploader from './FileUploader';

const mutateMock = vi.fn();

vi.mock('../../hooks/useFile', () => ({
  default: () => ({
    mutate: mutateMock,
    isPending: false,
  }),
}));

describe('FileUploader', () => {
  beforeEach(() => {
    mutateMock.mockReset();
  });

  it('captura um arquivo valido e dispara upload ao clicar no botao', async () => {
    const user = userEvent.setup();
    const onFileUploaded = vi.fn();

    render(<FileUploader onFileUploaded={onFileUploaded} />);

    const input = document.querySelector('input[type="file"]');
    const file = new File(['conteudo'], 'sample.png', { type: 'image/png' });

    await user.upload(input, file);

    expect(screen.getByText('sample.png')).toBeInTheDocument();
    expect(screen.getByText(/Arquivo pronto para envio/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /enviar arquivo/i }));

    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock).toHaveBeenCalledWith(
      file,
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    );
  });

  it('mostra erro quando o arquivo excede o tamanho maximo', async () => {
    const user = userEvent.setup();

    render(<FileUploader onFileUploaded={vi.fn()} />);

    const input = document.querySelector('input[type="file"]');
    const file = new File(['conteudo'], 'sample.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', {
      value: 21 * 1024 * 1024,
    });

    await user.upload(input, file);

    expect(screen.getByText(/Arquivo muito grande/i)).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });
});
