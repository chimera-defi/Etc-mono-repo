import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WithdrawalQueue } from '@/components/WithdrawalQueue';
import type { WithdrawalRequest } from '@/mocks/data';

const mockOnClaim = jest.fn().mockResolvedValue(undefined);

const createRequest = (
  id: number,
  amount: bigint,
  isClaimable: boolean,
  currentTime: number
): WithdrawalRequest => ({
  id,
  amount,
  requestedAt: currentTime - 86400000 * 3, // 3 days ago
  claimableAt: isClaimable ? currentTime - 86400000 : currentTime + 86400000 * 4, // Ready or 4 days remaining
});

describe('WithdrawalQueue', () => {
  const currentTime = Date.now();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no requests', () => {
    render(
      <WithdrawalQueue
        requests={[]}
        onClaim={mockOnClaim}
        currentTime={currentTime}
      />
    );

    expect(screen.getByText(/no pending withdrawals/i)).toBeInTheDocument();
  });

  it('renders pending requests correctly', () => {
    const requests = [
      createRequest(1, 1000_000000000000000000n, false, currentTime),
    ];

    render(
      <WithdrawalQueue
        requests={requests}
        onClaim={mockOnClaim}
        currentTime={currentTime}
      />
    );

    expect(screen.getByText('1,000.00 AZTEC')).toBeInTheDocument();
    expect(screen.getByText('Unbonding')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /claim/i })).not.toBeInTheDocument();
  });

  it('shows claim button for claimable requests', () => {
    const requests = [
      createRequest(1, 500_000000000000000000n, true, currentTime),
    ];

    render(
      <WithdrawalQueue
        requests={requests}
        onClaim={mockOnClaim}
        currentTime={currentTime}
      />
    );

    expect(screen.getByText('500.00 AZTEC')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /claim/i })).toBeInTheDocument();
  });

  it('calls onClaim when claim button is clicked', async () => {
    const requests = [
      createRequest(1, 500_000000000000000000n, true, currentTime),
    ];

    render(
      <WithdrawalQueue
        requests={requests}
        onClaim={mockOnClaim}
        currentTime={currentTime}
      />
    );

    const claimButton = screen.getByRole('button', { name: /claim/i });
    fireEvent.click(claimButton);

    await waitFor(() => {
      expect(mockOnClaim).toHaveBeenCalledWith(1);
    });
  });

  it('renders multiple requests correctly', () => {
    const requests = [
      createRequest(1, 1000_000000000000000000n, false, currentTime),
      createRequest(2, 500_000000000000000000n, true, currentTime),
    ];

    render(
      <WithdrawalQueue
        requests={requests}
        onClaim={mockOnClaim}
        currentTime={currentTime}
      />
    );

    expect(screen.getByText('1,000.00 AZTEC')).toBeInTheDocument();
    expect(screen.getByText('500.00 AZTEC')).toBeInTheDocument();
    expect(screen.getByText('Unbonding')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });
});
