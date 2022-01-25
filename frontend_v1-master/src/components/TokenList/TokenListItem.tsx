import React from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { AppDispatch } from '../../state';
import { selectToken } from '../../state/tokens/actions';
import {
  useIsHistorySelected,
  useSelectedToken,
} from '../../state/tokens/hooks';
import { TimeHistory, Token } from '../../types';
import { getSortedPrices } from '../../utils';
import LineChart from './LineChart';
import { useHistory } from 'react-router-dom';
import TokenIcon from '../TokenIcon';

interface TokenListItemProps extends Token {
  /**
   * Title of the item
   */
  title: string;
  /**
   * Subtitle of the item
   */
  subtitle: string;

  selectable?: boolean;
}

const Wrapper = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 15px;
  cursor: pointer;
  background-color: ${({ selected, theme }) =>
    selected ? theme.colors.secondary : 'auto'};
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  transition: all 0.1s ease-in;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const ItemWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  &:first-child {
    justify-content: flex-start;
    & > {
      margin-right: auto;
    }

    img {
      padding-right: 8px;
    }
  }
  &:last-child {
    justify-content: flex-end;
    & > {
      margin-left: auto;
    }
  }
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 4px;
`;

const Title = styled.span`
  font-size: 16px;
  font-weight: 600;
`;

const Subtitle = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.text.secondary};
`;

const PriceWrapper = styled.span<{ upwardsTrend?: boolean }>`
  color: ${(props) =>
    props.upwardsTrend ? props.theme.text.green : props.theme.text.red};
  font-size: 14px;
`;

export default function (props: TokenListItemProps) {
  const dispatch = useDispatch<AppDispatch>();
  // Get the last day of data
  const prices = getSortedPrices(props.prices[TimeHistory.ONE_DAY]!); // should always be loaded;
  let upwardsTrend = false;
  if (prices.length === 0 || prices[0] < prices[prices.length - 1]) {
    upwardsTrend = true;
  }

  const selectedToken = useSelectedToken();
  const isHistorySelected = useIsHistorySelected();

  const history = useHistory();

  const redirect = (token: string) => {
    dispatch(selectToken(token));
    history.push('/trade');
  };

  return (
    <Wrapper
      selected={
        !!props.selectable &&
        !isHistorySelected &&
        props.ticker === selectedToken?.ticker
      }
      onClick={() =>
        props.selectable
          ? dispatch(selectToken(props.ticker))
          : redirect(props.ticker)
      }
    >
      <ItemWrapper>
        <TokenIcon token={props} />
        <TextWrapper>
          <Title>{props.title}</Title>
          <Subtitle>{props.subtitle}</Subtitle>
        </TextWrapper>
      </ItemWrapper>
      <ItemWrapper>
        <LineChart data={prices} />
      </ItemWrapper>
      <ItemWrapper>
        <PriceWrapper upwardsTrend={upwardsTrend}>
          $
          {props.currentPrice.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </PriceWrapper>
      </ItemWrapper>
    </Wrapper>
  );
}
