import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useActiveWeb3React } from '../../hooks';
import { useDebounce } from '../../utils';
import { updateBlockNumber } from './actions';

export default function (): null {
  const { library, chainId } = useActiveWeb3React();
  const dispatch = useDispatch();

  const [state, setState] = useState<{
    chainId: number | undefined;
    blockNumber: number | null;
  }>({
    chainId,
    blockNumber: null,
  });

  const blockNumberCallback = useCallback(
    (blockNumber: number) => {
      setState((state) => {
        if (chainId === state.chainId) {
          if (typeof state.blockNumber !== 'number')
            return { chainId, blockNumber };
          return {
            chainId,
            blockNumber: Math.max(blockNumber, state.blockNumber),
          };
        }
        return state;
      });
    },
    [chainId, setState],
  );

  useEffect(() => {
    if (!library || !chainId) return undefined;

    setState({ chainId, blockNumber: null });

    library
      .getBlockNumber()
      .then(blockNumberCallback)
      .catch((error: Error) =>
        console.error(
          `Failed to get block number for chainId: ${chainId}`,
          error,
        ),
      );

    library.on('block', blockNumberCallback);
    return () => {
      library.removeListener('block', blockNumberCallback);
    };
  }, [dispatch, chainId, library, blockNumberCallback]);

  const debouncedState = useDebounce(state, 100);

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockNumber) return;
    dispatch(
      updateBlockNumber({
        chainId: debouncedState.chainId,
        blockNumber: debouncedState.blockNumber,
      }),
    );
  }, [dispatch, debouncedState.blockNumber, debouncedState.chainId]);

  return null; // Explicit return type
}
