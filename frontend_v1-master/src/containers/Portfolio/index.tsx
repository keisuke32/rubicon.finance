import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import Loader from '../../components/Loader';
import PortfolioView from '../../components/PortfolioView';
import TokenList from '../../components/TokenList';
import { AppDispatch } from '../../state';
import { selectToken } from '../../state/tokens/actions';
import { useIsTokenSelected } from '../../state/tokens/hooks';
import {
  useIsUserTokenPending,
  useUserTokensWithPendingBalances,
} from '../../state/user/hooks';

const LoaderWrapper = styled.div`
  height: 100vh;
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
`;

export default function () {
  const dispatch = useDispatch<AppDispatch>();
  const [userTokens, pendingLoading] = useUserTokensWithPendingBalances();
  const userPending = useIsUserTokenPending();
  const tokenSelected = useIsTokenSelected();

  useEffect(() => {
    if (!tokenSelected && userTokens.length > 0) {
      dispatch(selectToken(userTokens[0].ticker));
    }
  }, [tokenSelected, userTokens, dispatch]);

  const data = useMemo(
    () =>
      userTokens.map((t) => ({
        ...t,
        title: t.ticker,
        subtitle: `${t.quantity.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} TOKENS`,
      })),
    [userTokens],
  );

  return (
    <>
      {userPending || pendingLoading ? (
        <LoaderWrapper>
          <Loader size="50px" />
        </LoaderWrapper>
      ) : (
        <>
          <TokenList
            data={data}
            searchBar={false}
            selectable={false}
            isHistory={false}
          />
          <PortfolioView />
        </>
      )}
    </>
  );
}
