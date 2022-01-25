import React, { useMemo } from 'react';
import styled from 'styled-components';
import Loader, { LoaderWrapper } from '../Loader';
import PastTradeItem from './PastTradeItem';
import {
  useIsHistorySelected,
  useSelectedToken,
} from '../../state/tokens/hooks';
import { AlertCircle } from 'react-feather';
import { UserTrade } from '../../types';
import {
  useUserTrades,
  useIsUserTradesLoading,
} from '../../state/trades/hooks';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.secondary};
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Header = styled.div`
  align-items: center;
  width: 100%;
  text-align: center;
  padding: 20px;
  font-weight: bold;
`;

const BodyWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 0 10%;
  flex-direction: column;
  overflow-y: scroll;

  ::-webkit-scrollbar {
    width: 0px;
  }
`;

const TableHeader = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-around;
  color: ${({ theme }) => theme.text.secondary};
`;

const ContentWrapper = styled.div`
  overflow-y: scroll;
  display: flex;
  flex-direction: column;

  ::-webkit-scrollbar {
    width: 0px;
  }
`;

const Warning = styled.div`
  display: flex;
  align-items: center;
  text-transform: uppercase;
  font-size: 12px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export default function () {
  const data = useUserTrades();
  const loading = useIsUserTradesLoading();
  const isHistorySelected = useIsHistorySelected();
  const selectedToken = useSelectedToken();

  const sortedTrades = useMemo(() => {
    // here, create the History data
    if (loading) return [];
    const tradeData: UserTrade[] = [];
    if (isHistorySelected) {
      Object.keys(data).forEach((key) => {
        tradeData.push(...data[key].trades);
      });
    } else if (selectedToken) {
      tradeData.push(...data[selectedToken.ticker].trades);
    }
    const results = tradeData.slice().sort((a, b) => b.timestamp - a.timestamp);
    let bigIndex = 0;
    for (let i = 1; i < results.length - 1; ) {
      if (results[bigIndex].transactionHash === results[i].transactionHash) {
        results.splice(bigIndex, 1, {
          ...results[bigIndex],
          payAmount: results[bigIndex].payAmount + results[i].payAmount,
          buyAmount: results[bigIndex].buyAmount + results[i].buyAmount,
        });
        results.splice(i, 1);
      } else {
        bigIndex = i++;
      }
    }
    return results;
  }, [selectedToken, isHistorySelected, loading, data]);
  return (
    <Wrapper>
      <Header>Trade History</Header>
      <BodyWrapper>
        <TableHeader>
          {['Token', 'Action', 'Size', 'Price', 'Timestamp', 'Details'].map(
            (item) => (
              <span style={{ width: '20%', textAlign: 'center' }} key={item}>
                {item}
              </span>
            ),
          )}
        </TableHeader>
        <ContentWrapper>
          {loading ? (
            <LoaderWrapper style={{ paddingTop: '30px' }}>
              <Loader size="50px" />
            </LoaderWrapper>
          ) : (
            <>
              {sortedTrades.map((trade) => (
                <PastTradeItem data={trade} key={trade.transactionHash} />
              ))}
            </>
          )}
        </ContentWrapper>
        {sortedTrades.length === 0 && !loading && (
          <Warning>
            <AlertCircle size={12} style={{ marginRight: 5 }} />
            No trades found
          </Warning>
        )}
      </BodyWrapper>
    </Wrapper>
  );
}
