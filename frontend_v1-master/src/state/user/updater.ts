import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '..';
import { useTokenBalances } from '../../hooks/wallet';
import { UserToken } from '../../types';
import { useIsTokenPending, useTokens } from '../tokens/hooks';
import { fetchUserTokenList } from './actions';

export default function (): null {
  const dispatch = useDispatch<AppDispatch>();

  const isTokenPending = useIsTokenPending();

  const tokens = useTokens();

  const [userTokens, userTokensLoading] = useTokenBalances();

  const fetchTokens = useCallback(async () => {
    dispatch(fetchUserTokenList.pending());

    if (isTokenPending || userTokensLoading) return;

    // must ignore the quote balances
    const toDispatch = Object.keys(userTokens)
      .map<UserToken | undefined>((ticker) => {
        const token = tokens.find((t) => t.ticker === ticker)!;
        if (!token) return undefined;
        return {
          ...token,
          quantity: userTokens[ticker].toNumber(),
        };
      })
      .filter((t) => t !== undefined && t.quantity > 0) as UserToken[];

    dispatch(fetchUserTokenList.fulfilled(toDispatch));
  }, [dispatch, isTokenPending, tokens, userTokens, userTokensLoading]);

  // load in the tokens
  useEffect(() => {
    fetchTokens();
  }, [isTokenPending, fetchTokens, userTokensLoading]);

  return null;
}
