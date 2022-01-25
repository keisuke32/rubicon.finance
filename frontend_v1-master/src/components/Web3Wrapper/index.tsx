import React, { useEffect } from 'react';
import { useActiveWeb3React, useEagerConnect } from '../../hooks';
import styled from 'styled-components';
import { injected } from '../../connectors';
import Loader from '../Loader';
import logo from '../../assets/img/logo-text.png';
import { useWebSocket } from '../SocketProvider';

const MessageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 30px;
  height: 20rem;
`;

const MessageTitle = styled.h2`
  color: ${({ theme }) => theme.text.tertiary};
`;

const MessageBody = styled.p`
  color: ${({ theme }) => theme.text.tertiary};
`;

const Logo = styled.img`
  width: 150px;
`;

export default function ({ children }: { children: JSX.Element }) {
  const { active, activate } = useActiveWeb3React();

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  const websocket = useWebSocket();

  useEffect(() => {
    if (triedEager && !active) {
      activate(injected, undefined, true).catch((err) => {
        console.error(`Failed to activate account`, err);
      });
    }
  }, [triedEager, active, activate]);

  if (websocket.loading || (!triedEager && !active)) {
    return (
      <MessageWrapper>
        <Loader size="100px" />
      </MessageWrapper>
    );
  } else if (triedEager && !active) {
    // failed
    return (
      <MessageWrapper>
        <Logo src={logo} alt="logo" />
        <MessageTitle>MetaMask Account Locked</MessageTitle>
        <MessageBody>
          You are trying to access Rubicon without an unlocked account. Unlock
          your account on the Metamask Extension.
        </MessageBody>
      </MessageWrapper>
    );
  }
  return children;
}
