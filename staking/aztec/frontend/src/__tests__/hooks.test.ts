import { renderHook, act } from '@testing-library/react';
import { useWallet } from '@/hooks/useWallet';
import { useStaking } from '@/hooks/useStaking';

describe('useWallet', () => {
  it('starts disconnected', () => {
    const { result } = renderHook(() => useWallet());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.address).toBeNull();
    expect(result.current.isConnecting).toBe(false);
  });

  it('connects wallet correctly', async () => {
    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.address).toBeDefined();
    expect(result.current.address).toContain('0x');
  });

  it('disconnects wallet correctly', async () => {
    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.isConnected).toBe(true);

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.address).toBeNull();
  });
});

describe('useStaking', () => {
  it('returns protocol data', () => {
    const { result } = renderHook(() => useStaking(false));

    expect(result.current.exchangeRate).toBe(10250);
    expect(result.current.tvl).toBe(10500000);
    expect(result.current.apy).toBe(8.5);
  });

  it('returns zero balances when disconnected', () => {
    const { result } = renderHook(() => useStaking(false));

    expect(result.current.aztecBalance).toBe(0n);
    expect(result.current.stAztecBalance).toBe(0n);
    expect(result.current.withdrawalRequests).toHaveLength(0);
  });

  it('returns user balances when connected', () => {
    const { result } = renderHook(() => useStaking(true));

    expect(result.current.aztecBalance).toBeGreaterThan(0n);
    expect(result.current.stAztecBalance).toBeGreaterThan(0n);
    expect(result.current.withdrawalRequests.length).toBeGreaterThanOrEqual(0);
  });

  it('stakes correctly', async () => {
    const { result } = renderHook(() => useStaking(true));

    const initialAztec = result.current.aztecBalance;
    const initialStAztec = result.current.stAztecBalance;

    await act(async () => {
      await result.current.stake(1000_000000000000000000n);
    });

    expect(result.current.aztecBalance).toBeLessThan(initialAztec);
    expect(result.current.stAztecBalance).toBeGreaterThan(initialStAztec);
  });

  it('requests withdrawal correctly', async () => {
    const { result } = renderHook(() => useStaking(true));

    const initialStAztec = result.current.stAztecBalance;
    const initialRequests = result.current.withdrawalRequests.length;

    await act(async () => {
      await result.current.requestWithdrawal(1000_000000000000000000n);
    });

    expect(result.current.stAztecBalance).toBeLessThan(initialStAztec);
    expect(result.current.withdrawalRequests.length).toBe(initialRequests + 1);
  });
});
