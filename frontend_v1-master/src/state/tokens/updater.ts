import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '..';
import { useWebSocket } from '../../components/SocketProvider';
import { DEFAULT_CHAIN, supportedNetworks } from '../../config';
import { useActiveWeb3React } from '../../hooks';
import { TimeHistoryEntry, Token, TokenTrade } from '../../types';
import { findTokenByAddress, getTokenAddress } from '../../utils';
import { useIsQuotePending, useSelectedQuote } from '../quotes/hooks';
import {
  fetchTokenList,
  fetchTokenTimeHistory,
  selectToken,
  updateOrderBook,
  updatePrice,
} from './actions';
import { useSelectedTimeHistory, useSelectedToken, useTokens } from './hooks';

export default function (): null {
  const dispatch = useDispatch<AppDispatch>();
  const { chainId } = useActiveWeb3React();
  const websocket = useWebSocket();
  const quotesLoading = useIsQuotePending();
  const quoteTicker = useSelectedQuote();

  useEffect(() => {
    // TODO: improvement-> Dont repeat yourself -> assert right network
    if (chainId && !supportedNetworks.includes(chainId)) return;
    if (websocket.loading || quotesLoading || !quoteTicker) return;
    // TODO: Should we cleanup TokenList? otherwise addresses will be wrong until LOAD_TOKENS returns
    dispatch(fetchTokenList.pending());
    websocket.socket?.emit(
      'LOAD_TOKENS',
      chainId || DEFAULT_CHAIN,
      quoteTicker.ticker,
      (tokens: Token[]) => {
        if (tokens[0]) dispatch(selectToken(tokens[0].ticker));
        dispatch(fetchTokenList.fulfilled(tokens));
      },
    );
  }, [
    dispatch,
    websocket.loading,
    chainId,
    quoteTicker,
    quotesLoading,
    websocket.socket,
  ]);

  const selectedToken = useSelectedToken();
  const timeHistory = useSelectedTimeHistory();

  useEffect(() => {
    if (chainId && !supportedNetworks.includes(chainId)) return;
    if (!selectedToken || !quoteTicker) {
      return;
    }

    if (!(timeHistory in selectedToken.prices)) {
      dispatch(fetchTokenTimeHistory.pending());
      websocket.socket?.emit(
        'LOAD_TIME_HISTORY',
        chainId,
        selectedToken.ticker,
        quoteTicker.ticker,
        timeHistory,
        (timeHistoryEntry: TimeHistoryEntry) => {
          dispatch(fetchTokenTimeHistory.fulfilled(timeHistoryEntry));
        },
      );
    }
  }, [
    dispatch,
    chainId,
    quoteTicker,
    selectedToken,
    timeHistory,
    websocket.socket,
  ]);

  const tokens = useTokens();

  useEffect(() => {
    if (chainId && !supportedNetworks.includes(chainId)) return;
    if (!selectedToken || !quoteTicker) {
      return;
    }

    const quoteAddress = getTokenAddress(quoteTicker, chainId!);

    websocket.socket?.on(
      'UPDATE_PRICE',
      (
        networkId: number,
        baseAddress: string,
        _quoteAddress: string,
        price: number,
      ) => {
        if (quoteAddress !== _quoteAddress) {
          return;
        } else if (chainId !== networkId) {
          return;
        }

        const toUpdate = findTokenByAddress(baseAddress, tokens);
        if (!toUpdate) {
          return; // shouldn't happen... but type safety
        }

        dispatch(updatePrice([toUpdate, price]));
      },
    );

    websocket.socket?.on(
      'UPDATE_ORDER_BOOK',
      (
        networkId: number,
        baseAddress: string,
        _quoteAddress: string,
        orderBook: { buys: TokenTrade[]; sells: TokenTrade[] },
      ) => {
        if (quoteAddress !== _quoteAddress) {
          return; // don't update if we aren't using this currency
        } else if (networkId !== chainId) {
          return; // don't update if it is a different network
        }

        const toUpdate = findTokenByAddress(baseAddress, tokens);
        if (!toUpdate) {
          return; // shouldn't happen... but type safety
        }

        dispatch(updateOrderBook([toUpdate, orderBook]));
      },
    );

    return () => {
      websocket.socket?.off('UPDATE_ORDER_BOOK');
      websocket.socket?.off('UPDATE_PRICE');
    };
  }, [dispatch, chainId, quoteTicker, selectedToken, websocket.socket, tokens]);

  return null;
}
