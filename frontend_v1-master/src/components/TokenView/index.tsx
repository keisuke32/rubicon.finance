import React, { useState } from 'react';
import styled from 'styled-components';
import {
  useSelectedTimeHistory,
  useSelectedToken,
  useTimeHistoryLoading,
} from '../../state/tokens/hooks';
import TradeModal from '../TradeModal';
import About from './About';
import HeaderView from './HeaderView';
import LineChart from '../LineChart';
import OrderBook from './OrderBook';
import TimeHistorySelector from '../TimeHistorySelector';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.secondary};
  display: flex;
  flex-direction: column;
`;

const Error = styled.h2`
  color: ${({ theme }) => theme.colors.tertiary};
`;

const BottomWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: calc(100% - 40px);
  margin: 0 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary};
  height: 100%;
  overflow: hidden;
  & > * {
    width: calc(50% - 20px);
    padding: 20px;
  }
`;

const TradeWrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: 20px;
  justify-content: flex-end;
`;

const TradeButton = styled.div`
  padding: 10px 30px;
  border-radius: 5px;
  color: ${({ theme }) => theme.text.againstRed};
  background-color: ${({ theme }) => theme.colors.tertiary};
  transition: all 0.1s ease-in;
  cursor: pointer;
  @media (max-width: 1200px) {
    font-size: 12px;
  }
  font-size: 16px;
  margin-right: 10px;

  &:hover {
    opacity: 0.7;
  }
`;

export default function () {
  const selectedToken = useSelectedToken();

  const selectedTimeHistory = useSelectedTimeHistory();

  const timeHistoryLoading = useTimeHistoryLoading();

  const [hoveredTimestamp, setHoveredTimestamp] =
    useState<number | undefined>(undefined);

  const [[buyOpen, sellOpen], setModalsOpen] = useState([false, false]);

  if (!selectedToken) {
    return (
      <Wrapper>
        <Error>Select a token to get started</Error>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <HeaderView timestamp={hoveredTimestamp} />
      <LineChart
        data={selectedToken.prices[selectedTimeHistory]}
        onHover={setHoveredTimestamp}
        loading={timeHistoryLoading}
      />
      <TimeHistorySelector />
      <BottomWrapper>
        <OrderBook />
        <About />
      </BottomWrapper>
      <TradeWrapper>
        <TradeButton onClick={() => setModalsOpen([true, false])}>
          Buy
        </TradeButton>
        <TradeButton onClick={() => setModalsOpen([false, true])}>
          Sell
        </TradeButton>
      </TradeWrapper>
      {(buyOpen || sellOpen) && (
        <TradeModal
          isOpen={buyOpen || sellOpen}
          isBuy={buyOpen}
          onRequestClose={() => setModalsOpen([false, false])}
        />
      )}
    </Wrapper>
  );
}
