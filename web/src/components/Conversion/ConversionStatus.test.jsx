import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ConversionStatus from './ConversionStatus';

const useConversionStatusMock = vi.fn();
const downloadMutateMock = vi.fn();

vi.mock('../../hooks/useConversion', () => ({
  useConversionStatus: (...args) => useConversionStatusMock(...args),
  useDownloadConvertedFile: () => ({
    mutate: downloadMutateMock,
    isPending: false,
  }),
}));

describe('ConversionStatus', () => {
  beforeEach(() => {
    useConversionStatusMock.mockReset();
    downloadMutateMock.mockReset();
  });

  it('renderiza estado completed e dispara download', async () => {
    const user = userEvent.setup();

    useConversionStatusMock.mockReturnValue({
      data: {
        status: 'completed',
        resultFile: 'arquivo-final.png',
        createdAt: '2026-03-12T12:00:00.000Z',
      },
      isLoading: false,
      error: null,
    });

    render(<ConversionStatus conversionId="conv_1" />);

    expect(screen.getByText(/Conversão concluída/i)).toBeInTheDocument();
    expect(screen.getByText(/arquivo-final\.png/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /baixar arquivo convertido/i }));

    expect(downloadMutateMock).toHaveBeenCalledWith('arquivo-final.png');
  });

  it('renderiza estado pending como conversão iniciada', () => {
    useConversionStatusMock.mockReturnValue({
      data: {
        status: 'pending',
        resultFile: null,
        createdAt: '2026-03-12T12:00:00.000Z',
      },
      isLoading: false,
      error: null,
    });

    render(<ConversionStatus conversionId="conv_2" />);

    expect(screen.getByText(/Conversão iniciada/i)).toBeInTheDocument();
  });
});
