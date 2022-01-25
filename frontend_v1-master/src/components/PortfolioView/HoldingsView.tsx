import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useUserTokensWithPendingBalances } from '../../state/user/hooks';
import { useQuoteBalance, useSelectedQuote } from '../../state/quotes/hooks';
import { useUserTokens } from '../../state/user/hooks';
import { QuoteUserToken } from '../../types';
import HoldingsItem from './HoldingsItem';
import HoldingsSwitch from './HoldingsSwitch';

const Wrapper = styled.div`
  margin: 10px 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const HeaderWrapperLeft = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const Header = styled.span`
  font-weight: 600;
  font-size: 14px;
  margin-right: 10px;
`;

const TableHeader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-top: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary};

  & > *:last-child {
    text-align: right;
  }
`;

const TableHeaderItem = styled.span<{ width: number }>`
  color: ${({ theme }) => theme.text.secondary};
  font-size: 14px;
  width: ${({ width }) => width}%;
`;

const TableContent = styled.div`
  overflow-y: scroll;
  ::-webkit-scrollbar {
    width: 0px;
  }
`;

const Select = styled.select`
  background: none;
  color: ${({ theme }) => theme.text.primary};
  font-size: 20px;
  font-weight: 500;
  font-family: 'Montserrat',sans-serif;
  border: 0;
`;

const Option = styled.option`
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.text.primary};
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
`;

export default function () {
  const [userTokens] = useUserTokensWithPendingBalances();
  const selectedQuote = useSelectedQuote()!;
  const quoteBalance = useQuoteBalance();

  const sortedUserTokens = useMemo(() => {
    const quoteToken: QuoteUserToken = {
      ...selectedQuote,
      quantity: quoteBalance || 0,
      currentPrice: 1.0, // lol
    };
    return [...userTokens, quoteToken].sort(
      (a, b) => b.quantity * b.currentPrice - a.quantity * a.currentPrice,
    );
  }, [userTokens, selectedQuote, quoteBalance]);

  const [useDollars, setUseDollars] = useState(true);

  const percentages = useMemo(() => {
    const totalHoldings = sortedUserTokens.reduce(
      (accum, next) => (accum += next.quantity * next.currentPrice),
      0,
    );

    return sortedUserTokens.reduce<{ [ticker: string]: number }>(
      (accum, next) => ({
        ...accum,
        [next.ticker]: (next.quantity * next.currentPrice) / totalHoldings,
      }),
      {},
    );
  }, [sortedUserTokens]);

  const [useNetwork, setNetwork] = useState("polygon");

  return (
    <Wrapper>
      <HeaderWrapper>
        <HeaderWrapperLeft>
          <Header>Total Holdings on the</Header>
          <Select onChange={(e) => setNetwork(e.target.value)}>
            <Option value="polygon">
              Polygon
            </Option>
            <Option value="ethereum">
              Ethereum
            </Option>
          </Select>
        </HeaderWrapperLeft>
        <HoldingsSwitch
          isActive={useDollars}
          toggle={() => setUseDollars(!useDollars)}
        />
      </HeaderWrapper>
      <TableHeader>
        <TableHeaderItem width={50}>Asset</TableHeaderItem>
        <TableHeaderItem width={25}>Price</TableHeaderItem>
        <TableHeaderItem width={25}>Holding</TableHeaderItem>
      </TableHeader>
      <TableContent>
        {sortedUserTokens.map((token) => (
          <HoldingsItem
            token={token}
            key={token.ticker}
            isQuote={token.ticker === selectedQuote.ticker}
            percentage={useDollars ? undefined : percentages[token.ticker]}
          />
        ))}
      </TableContent>
    </Wrapper>
  );
}
