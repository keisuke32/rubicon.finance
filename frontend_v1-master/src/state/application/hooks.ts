import { useSelector } from 'react-redux';
import { AppState } from '..';
import { useActiveWeb3React } from '../../hooks';

export function useBlockNumber(): number | undefined {
  const { chainId } = useActiveWeb3React();

  return useSelector(
    (state: AppState) => state.application.blockNumber[chainId ?? -1],
  );
}
