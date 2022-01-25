import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '..';
import { UserToken } from '../../types';
import { useIsUserTradesLoading, usePendingTrades } from '../trades/hooks';
import { useQuoteBalance } from '../quotes/hooks';

export function useUserTokens(): UserToken[] {
  return useSelector((state: AppState) => state.user.tokens);
}

export function useUserTokensWithPendingBalances(): [UserToken[], boolean] {
  const userTokens = useUserTokens();
  const pendingTrades = usePendingTrades();
  const tradesLoading = useIsUserTradesLoading();

  return [
    useMemo(
      () =>
        userTokens.map((token) => {
          const pendingTrade = pendingTrades[token.ticker];
          if (!pendingTrade) {
            return token;
          }
          return {
            ...token,
            quantity:
              token.quantity +
              pendingTrade.trades
                .filter((t) => !t.isBuy)
                .reduce((accum, next) => accum + next.payAmount, 0),
          };
        }),
      [userTokens, pendingTrades],
    ),
    tradesLoading,
  ];
}

export function useUserToken(ticker: string): UserToken | undefined {
  return useSelector((state: AppState) =>
    state.user.tokens.find((t) => t.ticker === ticker),
  );
}

export function useIsUserTokenPending(): boolean {
  return useSelector((state: AppState) => state.user.loading);
}

export function useUserTotal(): number {
  const tokens = useUserTokens();
  const quoteBalance = useQuoteBalance();
  return (
    tokens.reduce(
      (total, next) => (total += next.quantity * next.currentPrice),
      0,
    ) + (quoteBalance || 0)
  );
}
