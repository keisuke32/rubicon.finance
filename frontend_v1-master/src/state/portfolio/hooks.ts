import { useSelector } from 'react-redux';
import { AppState } from '..';
import { TimeHistoryEntry } from '../../types';
import { useSelectedTimeHistory } from '../tokens/hooks';

export function useIsPortfolioPending(): boolean {
  return useSelector((state: AppState) => state.portfolio.loading);
}

export function useIsPortfolioLoaded(): boolean {
  const selectedTimeHistory = useSelectedTimeHistory();
  return useSelector(
    (state: AppState) => selectedTimeHistory in state.portfolio.data,
  );
}

export function usePortfolioData(): TimeHistoryEntry | undefined {
  const selectedTimeHistory = useSelectedTimeHistory();
  return useSelector(
    (state: AppState) => state.portfolio.data[selectedTimeHistory],
  );
}
