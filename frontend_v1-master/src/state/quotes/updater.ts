import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '..';
import { useWebSocket } from '../../components/SocketProvider';
import { DEFAULT_CHAIN } from '../../config';
import { useActiveWeb3React } from '../../hooks';
import { QuoteToken } from '../../types';
import { fetchQuoteList, selectQuoteToken } from './actions';

export default function (): null {
  const dispatch = useDispatch<AppDispatch>();
  const { chainId } = useActiveWeb3React();
  const websocket = useWebSocket();

  useEffect(() => {
    if (websocket.loading || chainId == undefined) return;
    dispatch(fetchQuoteList.pending());
    websocket.socket?.emit(
      'LOAD_QUOTE_TOKENS',
      chainId,
      (quotes: QuoteToken[]) => {
        if (quotes.length) {
          dispatch(selectQuoteToken(quotes[0].ticker));
        }
        dispatch(fetchQuoteList.fulfilled(quotes));
      },
    );
  }, [dispatch, websocket.loading, chainId, websocket.socket]);

  return null;
}
