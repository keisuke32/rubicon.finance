import React, { useEffect, useMemo, useState } from 'react';
import CountUp from 'react-countup';
import styled from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import { useUserTotal } from '../../state/user/hooks';
import { TimeHistoryEntry } from '../../types';
import { getPercentChange, shortenAddress, usePrevious } from '../../utils';

interface HeaderViewProps {
  timestamp?: number;
  entry?: TimeHistoryEntry;
}

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary};
  padding: 20px 0px;
  margin: 0 20px;
`;

const ChildWrapper = styled.div`
  display: flex;
  flex-direction: column;

  &:last-child {
    text-align: right;
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

export default function ({ timestamp, entry }: HeaderViewProps) {
  const { account } = useActiveWeb3React();
  const userTotal = useUserTotal();

  // TODO: create a loading thing if the prices r being loaded

  const [absoluteDifference, percentChange] = useMemo(() => {
    return getPercentChange(entry, userTotal, timestamp);
  }, [entry, timestamp, userTotal]);

  const [displayPrice, setDisplayPrice] = useState(0);
  const prevDisplayPrice = usePrevious(displayPrice);

  useEffect(() => {
    setDisplayPrice(timestamp ? entry![timestamp] : userTotal);
  }, [entry, timestamp, userTotal]);

  const MemoCountUp = useMemo(() => {
    return (
      <StyledCountUp
        end={displayPrice}
        start={prevDisplayPrice}
        prefix="$"
        separator=","
        decimals={2}
        duration={0.25}
      />
    );
  }, [displayPrice]);

  return (
    <Wrapper>
      <ChildWrapper>
        {MemoCountUp}
        <SubtitleWrapper>
          <DifferenceWrapper upwardsTrend={absoluteDifference > 0}>
            {absoluteDifference > 0 ? '+' : ''}
            {absoluteDifference.toFixed(2)} ({(percentChange * 100).toFixed(2)}
            %)
          </DifferenceWrapper>{' '}
          {!timestamp && 'TODAY'}
        </SubtitleWrapper>
      </ChildWrapper>
      <ChildWrapper>
        <TitleWrapper>Portfolio</TitleWrapper>
        <SubtitleWrapper>{shortenAddress(account!)}</SubtitleWrapper>
      </ChildWrapper>
    </Wrapper>
  );
}
