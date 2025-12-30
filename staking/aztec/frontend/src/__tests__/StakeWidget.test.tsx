import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StakeWidget } from '@/components/StakeWidget';

const mockOnStake = jest.fn().mockResolvedValue(undefined);
const mockOnUnstake = jest.fn().mockResolvedValue(undefined);

const defaultProps = {
  onStake: mockOnStake,
  onUnstake: mockOnUnstake,
  userBalance: {
    aztec: 50000_000000000000000000n, // 50,000 AZTEC
    stAztec: 45000_000000000000000000n, // 45,000 stAZTEC
  },
  exchangeRate: 10250, // 1.025
  isConnected: true,
  aztecPriceUsd: 2.0,
};

describe('StakeWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders stake tab by default', () => {
    render(<StakeWidget {...defaultProps} />);
    
    expect(screen.getByText('Stake')).toBeInTheDocument();
    expect(screen.getByText('Unstake')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0.0')).toBeInTheDocument();
    expect(screen.getByText('AZTEC', { selector: 'span' })).toBeInTheDocument();
  });

  it('shows connect wallet message when disconnected', () => {
    render(<StakeWidget {...defaultProps} isConnected={false} />);
    
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument();
  });

  it('calculates output amount correctly for staking', async () => {
    render(<StakeWidget {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('0.0');
    fireEvent.change(input, { target: { value: '1000' } });
    
    // Output should be 1000 * 10000 / 10250 ≈ 975.60 stAZTEC
    await waitFor(() => {
      // Use getAllByText since the value appears in multiple places (output and exchange rate)
      const matches = screen.getAllByText(/975\.60/);
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  it('switches to unstake tab correctly', async () => {
    render(<StakeWidget {...defaultProps} />);
    
    const unstakeTab = screen.getByText('Unstake');
    fireEvent.click(unstakeTab);
    
    await waitFor(() => {
      expect(screen.getByText(/unbonding period/i)).toBeInTheDocument();
    });
  });

  it('disables button when amount exceeds balance', async () => {
    render(<StakeWidget {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('0.0');
    fireEvent.change(input, { target: { value: '100000' } }); // More than 50k balance
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /insufficient balance/i });
      expect(button).toBeDisabled();
    });
  });

  it('fills max amount when MAX button is clicked', async () => {
    render(<StakeWidget {...defaultProps} />);
    
    const maxButton = screen.getByRole('button', { name: /max/i });
    fireEvent.click(maxButton);
    
    const input = screen.getByPlaceholderText('0.0') as HTMLInputElement;
    // Due to floating point precision, check that it's approximately 50000
    expect(parseFloat(input.value)).toBeCloseTo(50000, 0);
  });

  it('calls onStake when stake button is clicked', async () => {
    render(<StakeWidget {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('0.0');
    fireEvent.change(input, { target: { value: '1000' } });
    
    const stakeButton = screen.getByRole('button', { name: /stake aztec/i });
    fireEvent.click(stakeButton);
    
    await waitFor(() => {
      expect(mockOnStake).toHaveBeenCalledWith(1000_000000000000000000n);
    });
  });
});
