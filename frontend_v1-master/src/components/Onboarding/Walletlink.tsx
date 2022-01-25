import React, { useCallback } from 'react';
import styled from 'styled-components';
import coinbaseWalletLogo from '../../assets/img/coinbaseWalletLogo1.png';

import { useActiveWeb3React } from '../../hooks';
import { walletLink } from '../../connectors';
import { WalletOptionWrapper } from './index';

const CoinbaseWallet = styled.img`
  width: 100%;
  height: 85px;
  background-color: white;
  border-radius: 10px;
  border: 0.5px solid black;
`;

export default function WalletLinkConnectorButton() {
  const { activate } = useActiveWeb3React();

  const connect = useCallback(() => {
    activate(walletLink, undefined, true).catch((err) => {
      console.error(`Failed to activate account using walletLink`, err);
    });
  }, [activate]);

  return (
    <WalletOptionWrapper>
      <div onClick={connect}>
        <CoinbaseWallet src={coinbaseWalletLogo} alt="Coinbase" />
      </div>
    </WalletOptionWrapper>
  );
}
