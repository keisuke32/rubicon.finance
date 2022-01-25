import React from 'react';
import styled from 'styled-components';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { useActiveWeb3React } from '../../hooks';

const StyledIdenticonContainer = styled(Jazzicon)`
  height: 2rem;
  width: 2rem;
  border: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
`;

export default function Identicon() {
  const { account } = useActiveWeb3React();

  return <StyledIdenticonContainer address={account!} />;
}
