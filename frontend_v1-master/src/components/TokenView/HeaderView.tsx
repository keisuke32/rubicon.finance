import React, { useEffect, useMemo, useState } from 'react';
import CountUp from 'react-countup';
import styled from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import {
  useSelectedTimeHistory,
  useSelectedToken,
} from '../../state/tokens/hooks';
import {
  getEtherscanLink,
  getTokenAddress,
  getTokenPercentChange,
  usePrevious,
} from '../../utils';
import TokenIcon from '../TokenIcon';

interface HeaderViewProps {
  timestamp?: number;
}

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary};
  padding: 20px 0px;
  margin: 0 20px;
`;

const ColWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ColWrapperWithTA = styled(ColWrapper)`
  text-align: right;
`;

const RowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  img {
    padding-left: 8px;
  }
`;

const DifferenceWrapper = styled.span<{ upwardsTrend?: boolean }>`
  color: ${(props) =>
    props.upwardsTrend ? props.theme.text.green : props.theme.text.red};
`;

const TitleWrapper = styled.span`
  font-size: 20px;
`;

const SubtitleWrapper = styled.span`
  color: ${({ theme }) => theme.text.secondary};
  font-size: 11px;
`;

const StyledCountUp = styled(CountUp)`
  font-size: 35px;
`;

const StyledA = styled.a`
  color: inherit;
  text-decoration: inherit;
`;

export default function ({ timestamp }: HeaderViewProps) {
  const selectedToken = useSelectedToken()!; // will always be defined here
  const selectedTimeHistory = useSelectedTimeHistory();

  const { chainId } = useActiveWeb3React();

  // TODO: create a loading thing if the prices r being loaded

  const [absoluteDifference, percentChange] = useMemo(() => {
    return getTokenPercentChange(selectedToken, timestamp, selectedTimeHistory);
  }, [selectedToken, timestamp, selectedTimeHistory]);

  const [displayPrice, setDisplayPrice] = useState(0);
  const prevDisplayPrice = usePrevious(displayPrice);

  useEffect(() => {
    setDisplayPrice(
      timestamp
        ? selectedToken.prices[selectedTimeHistory]![timestamp]
        : selectedToken.currentPrice,
    );
  }, [selectedToken, timestamp, selectedTimeHistory]);

  const MemoCountUp = useMemo(() => {
    return (
      <StyledCountUp
        end={displayPrice}
        start={prevDisplayPrice}
        prefix="$"
        separator=","
        duration={0.25}
        decimals={2}
      />
    );
  }, [displayPrice]);

  return (
    <Wrapper>
      <ColWrapper>
        {MemoCountUp}
        <SubtitleWrapper>
          <DifferenceWrapper upwardsTrend={absoluteDifference > 0}>
            {absoluteDifference > 0 ? '+' : ''}
            {absoluteDifference.toFixed(2)} ({(percentChange * 100).toFixed(2)}
            %)
          </DifferenceWrapper>{' '}
          {!timestamp && 'TODAY'}
        </SubtitleWrapper>
      </ColWrapper>
      <StyledA
        href={getEtherscanLink(
          chainId!,
          getTokenAddress(selectedToken, chainId!)!,
          'token',
        )}
        target="_blank"
        rel="noopener noreferrer"
      >
        <RowWrapper>
          <ColWrapperWithTA>
            <TitleWrapper>{selectedToken.ticker}</TitleWrapper>
            <SubtitleWrapper>{selectedToken.name}</SubtitleWrapper>
          </ColWrapperWithTA>
          <TokenIcon token={selectedToken} size="50px" />
        </RowWrapper>
      </StyledA>
    </Wrapper>
  );
}
