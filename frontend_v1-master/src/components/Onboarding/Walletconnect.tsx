import React, { useCallback } from 'react';
import walletConnectLogo from '../../assets/img/walletconnect-logo.png';

import styled from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import { walletConnect, resetWalletConnector } from '../../connectors';
import { NoEthereumProviderError } from '@web3-react/injected-connector';
import { WalletOptionWrapper } from './index';

const WalletConnect = styled.img`
  width: 100%;
  height: 85px;
  background-color: white;
  border-radius: 10px;
  border: 0.5px solid black;
  padding: 21px 10px 21px 10px;
`;

export default function WalletConnectConnectorButton() {
  const { activate } = useActiveWeb3React();

  const connect = useCallback(() => {
    activate(walletConnect, undefined, true).catch((err) => {
      // console.error(`Failed to activate account using walletConnect`, err);
      resetWalletConnector(walletConnect);
      // if (err instanceof NoEthereumProviderError) {}
    });
  }, [activate]);

  return (
    <WalletOptionWrapper>
      <div onClick={connect}>
        <WalletConnect src={walletConnectLogo} alt="WalletConnect" />
      </div>
    </WalletOptionWrapper>
  );
}
