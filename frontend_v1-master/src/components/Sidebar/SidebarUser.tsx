import React from 'react';
import { ChevronUp } from 'react-feather';
import styled from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import { useBlockNumber } from '../../state/application/hooks';
import { getChainLabel, shortenAddress } from '../../utils';
import Identicon from '../Identicon';

interface SidebarUserProps {
  onOpenUser: () => void;
  onOpenNetwork: () => void;
}

const Wrapper = styled.div`
  margin-top: auto;
  position: relative;
  padding: 15px 15px;
  background-color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
`;

const NetworkCard = styled.span`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 5px;
  opacity: 0.9;
  font-size: 9px;
  top: -30px;
  font-weight: 500;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.againstRed};
  background-color: ${({ theme }) => theme.colors.tertiary};
  padding: 5px 10px;
  white-space: nowrap;
`;

const UserIdentification = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  width: 100%;
`;

const StyledChevronsUp = styled(ChevronUp)`
  margin-left: auto;
`;

const UserText = styled.span`
  margin-left: 10px;
  font-size: 12px;
`;

export default function (props: SidebarUserProps) {
  const { account, chainId } = useActiveWeb3React();
  const blockNumber = useBlockNumber();

  const chainLabel = getChainLabel(chainId);
  return (
    <Wrapper>
      {chainId && chainLabel && (
        <NetworkCard onClick={props.onOpenNetwork}>{chainLabel}</NetworkCard>
      )}
      <UserIdentification onClick={props.onOpenUser}>
        <Identicon />
        <UserText>{shortenAddress(account!)}</UserText>
        <StyledChevronsUp size={14} />
      </UserIdentification>
    </Wrapper>
  );
}
