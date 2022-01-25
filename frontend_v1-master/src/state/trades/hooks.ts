import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '..';
import { UserTrades } from '../../types';

// good grammar
export function useIsUserTradesLoading(): boolean {
  return useSelector((state: AppState) => state.trades.loading);
}

export function useUserTrades(): UserTrades {
  return useSelector((state: AppState) => state.trades.trades);
}

export function usePendingTrades(): UserTrades {
  const trades = useUserTrades();

  const pendingTrades = useMemo(() => {
    return Object.keys(trades).reduce(
      (accum, next) => ({
        ...accum,
        [next]: {
          ...trades[next],
          trades: trades[next].trades.filter((t) => !t.completed && !t.killed),
        },
      }),
      {},
    );
  }, [trades]);
  return pendingTrades;
}
