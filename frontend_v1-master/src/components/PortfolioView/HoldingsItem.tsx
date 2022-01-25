import React from 'react';
import { ChevronUp, ChevronDown } from 'react-feather';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { AppDispatch } from '../../state';
import { selectToken } from '../../state/tokens/actions';
import { QuoteUserToken, UserToken } from '../../types';
import { getTokenPercentChange } from '../../utils';
import TokenIcon from '../TokenIcon';

interface HoldingsItemProps {
  token: UserToken | QuoteUserToken;
  percentage?: number;
  isQuote?: boolean;
}

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary};

  & > *:last-child {
    text-align: right;
  }
`;

const TableItem = styled.span<{ width: number }>`
  color: ${({ theme }) => theme.text.primary};
  font-size: 16px;
  width: ${({ width }) => width}%;
  font-weight: 600;
`;

const DoubleItemRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  img {
    padding-right: 8px;
  }
`;

const DoubleItem = styled.div`
  display: flex;
  flex-direction: column;

  & > *:last-child {
    margin-top: 5px;
  }
`;

const Subtitle = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.text.secondary};
`;

const PercentBox = styled.div<{ upwards: boolean }>`
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  background-color: ${({ theme, upwards }) =>
    upwards ? theme.text.opaqueGreen : theme.text.opaqueRed};
  border-radius: 4px;
  padding: 1px 3px;
`;

const StyledChevronUp = styled(ChevronUp)`
  color: ${({ theme }) => theme.text.green};
`;

const StyledChevronDown = styled(ChevronDown)`
  color: ${({ theme }) => theme.text.red};
`;

export default function ({ token, percentage, isQuote }: HoldingsItemProps) {
  const [, percentChange] = isQuote
    ? [0, 0]
    : getTokenPercentChange(token as UserToken);
  const upwards = percentChange > 0;

  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory();

  const redirect = (token: string) => {
    dispatch(selectToken(token));
    history.push('/trade');
  };

  return (
    <Wrapper>
      <TableItem
        width={50}
        style={{ fontSize: '18px', cursor: 'pointer' }}
        onClick={() => (!isQuote ? redirect(token.ticker) : null)}
      >
        <DoubleItemRow>
          <TokenIcon token={token} />
          {token.ticker}
        </DoubleItemRow>
      </TableItem>
      <TableItem width={25}>
        <DoubleItem>
          <span>
            $
            {token.currentPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span>
            <PercentBox upwards={upwards}>
              {upwards ? (
                <StyledChevronUp size="15px" />
              ) : (
                <StyledChevronDown size="15px" />
              )}
              <span>{(percentChange * 100).toFixed(2)}%</span>
            </PercentBox>
          </span>
        </DoubleItem>
      </TableItem>
      <TableItem width={25}>
        <DoubleItem>
          <span>
            {percentage
              ? `${(percentage * 100).toFixed(2)}%`
              : `$${(token.currentPrice * token.quantity).toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  },
                )}`}
          </span>
          <Subtitle>
            {token.quantity.toLocaleString(undefined, {
              minimumFractionDigits: 4,
              maximumFractionDigits: 4,
            })}{' '}
            {token.ticker}
          </Subtitle>
        </DoubleItem>
      </TableItem>
    </Wrapper>
  );
}
