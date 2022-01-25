import { useSelector } from 'react-redux';
import { AppState } from '..';
import { useTokenBalances } from '../../hooks/wallet';
import { QuoteToken } from '../../types';

export function useQuotes(): QuoteToken[] {
  return useSelector((state: AppState) => state.quotes.quotes);
}

export function useIsQuoteSelected(): boolean {
  return useSelector((state: AppState) => !!state.quotes.selected);
}

export function useSelectedQuote(): QuoteToken | undefined {
  return useSelector((state: AppState) => {
    return state.quotes.quotes.find((t) => t.ticker === state.quotes.selected);
  });
}

export function useIsQuotePending(): boolean {
  return useSelector((state: AppState) => state.quotes.loading);
}

export function useQuoteBalance(): number | undefined {
  const balances = useTokenBalances();
  const quote = useSelectedQuote();
  return quote && quote.ticker in balances[0]
    ? balances[0][quote.ticker].toNumber()
    : undefined;
}
