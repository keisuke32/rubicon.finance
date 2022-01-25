import React from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { AppDispatch } from '../../state';
import { selectTimeHistory } from '../../state/tokens/actions';
import { useSelectedTimeHistory } from '../../state/tokens/hooks';
import { TimeHistory } from '../../types';

const SELECTED_CLASS = 'selected';

const OneMoreWrapper = styled.div`
  padding: 20px;
  padding-top: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary};
  margin: 0 20px;
`;

const Wrapper = styled.div`
  width: calc(100% - 80px);
  display: flex;
  margin: 0 40px;
  flex-direction: row;
  justify-content: space-between;
`;

const Item = styled.span`
  color: ${({ theme }) => theme.text.tertiary};
  text-transform: uppercase;
  font-size: 12px;
  transition: all 0.2s ease-in;
  cursor: pointer;
  padding: 10px 0;
  font-weight: 500;
  margin: 0 10px;

  &:hover {
    opacity: 0.5s;
  }

  &.${SELECTED_CLASS} {
    opacity: 0.5;
    border-bottom: 1px solid ${({ theme }) => theme.colors.tertiary};
  }
`;

function getTimeHistoryDisplays(): string[] {
  return Object.values(TimeHistory);
}

export default function () {
  const dispatch = useDispatch<AppDispatch>();

  const selectedTimeHistory = useSelectedTimeHistory();
  return (
    <OneMoreWrapper>
      <Wrapper>
        {getTimeHistoryDisplays().map((item) => (
          <Item
            key={item}
            className={selectedTimeHistory === item ? SELECTED_CLASS : ''}
            onClick={() => dispatch(selectTimeHistory(item as TimeHistory))}
          >
            {item.split('|')[0]}
          </Item>
        ))}
      </Wrapper>
    </OneMoreWrapper>
  );
}
