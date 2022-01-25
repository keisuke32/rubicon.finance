import React from 'react';
import styled from 'styled-components';
import CountUp from 'react-countup';
import { useIsUserTokenPending, useUserTotal } from '../../state/user/hooks';
import { nFormatter } from '../../utils';

const Wrapper = styled.div`
  flex-direction: column;
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  padding-bottom: 15px;
`;

const Label = styled.span`
  text-transform: uppercase;
  font-size: 12px;
  margin-bottom: 3px;
  color: ${({ theme }) => theme.text.secondary};
`;

const UserTotal = styled.span`
  font-size: 22px;
  font-weight: 600;
`;

export default function () {
  const tokensLoading = useIsUserTokenPending();
  const userTotal = useUserTotal();

  return (
    <Wrapper>
      <Label>Portfolio Total:</Label>
      <UserTotal>
        <CountUp
          end={tokensLoading ? 0 : userTotal}
          decimals={2}
          prefix="$"
          separator=","
          formattingFn={nFormatter}
          duration={0.25}
        />
      </UserTotal>
    </Wrapper>
  );
}
