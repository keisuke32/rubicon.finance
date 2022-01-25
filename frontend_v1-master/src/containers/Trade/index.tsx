import React from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import Loader from '../../components/Loader';
import TokenList from '../../components/TokenList';
import TokenView from '../../components/TokenView';
import { AppDispatch } from '../../state';
import { deselectHistory } from '../../state/tokens/actions';
import { useTokens, useIsTokenPending } from '../../state/tokens/hooks';

const LoaderWrapper = styled.div`
  height: 100vh;
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
`;

export default function () {
  const tokens = useTokens();
  const tokensPending = useIsTokenPending();
  const dispatch = useDispatch<AppDispatch>();
  dispatch(deselectHistory());

  const data = tokens.map((t) => ({
    ...t,
    title: t.ticker,
    subtitle: t.name,
  }));

  return (
    <>
      {tokensPending ? (
        <LoaderWrapper>
          <Loader size="50px" />
        </LoaderWrapper>
      ) : (
        <>
          <TokenList
            data={data}
            searchBar={true}
            selectable={true}
            isHistory={false}
          />
          <TokenView />
        </>
      )}
    </>
  );
}
