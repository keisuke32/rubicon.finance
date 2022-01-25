import { useSelector } from 'react-redux';
import { AppState } from '..';
import { TimeHistory, Token } from '../../types';

export function useTokens(): Token[] {
  return useSelector((state: AppState) => state.tokens.tokens);
}

export function useIsTokenSelected(): boolean {
  return useSelector((state: AppState) => !!state.tokens.selected);
}

export function useSelectedToken(): Token | undefined {
  return useSelector((state: AppState) => {
    return state.tokens.tokens.find((t) => t.ticker === state.tokens.selected);
  });
}

export function useIsHistorySelected(): boolean {
  return useSelector((state: AppState) => state.tokens.historyAll);
}

export function useIsTokenPending(): boolean {
  return useSelector((state: AppState) => state.tokens.loading);
}

export function useSelectedTimeHistory(): TimeHistory {
  return useSelector((state: AppState) => state.tokens.selectedTimeHistory);
}

export function useTimeHistoryLoading(): boolean {
  return useSelector((state: AppState) => state.tokens.timeHistoryLoading);
}
