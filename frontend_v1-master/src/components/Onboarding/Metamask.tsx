import Modal from 'react-modal';
import React, { useCallback, useContext, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';
import mmLogo from '../../assets/img/metamask.svg';
import mmLogoFox from '../../assets/img/metamask_logo.svg';
import { X } from 'react-feather';
import { useActiveWeb3React } from '../../hooks';
import { injected } from '../../connectors';
import { UnsupportedChainIdError } from '@web3-react/core';
import { NoEthereumProviderError } from '@web3-react/injected-connector';
import { WalletOptionWrapper } from './index';

Modal.setAppElement('#root');

const MetaMaskConnectButton = styled.img`
  width: 100%;
  height: 85px;
  background-color: white;
  border-radius: 10px;
  border: 0.5px solid black;
`;

const MMLogo = styled.img`
  height: 42px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 0 20px 0;
  border-bottom: 1px;
  border-bottom-style: solid;
  border-bottom-color: rgb(61 63 78);
  align-items: flex-start;
  svg {
    cursor: pointer;
  }
  h2 {
    margin: 10px 0 0 0;
  }
`;

const MetaMaskInstallButton = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  display: flex;
  justify-content: flex-end;
  border-top: 1px;
  border-top-style: solid;
  border-top-color: rgb(61 63 78);
  padding-top: 10px;
  div {
    cursor: pointer;
  }
  a {
    background-color: white;
    border-radius: 10px;
    padding: 0 5px 0 5px;
    display: flex;
    align-items: center;
    text-decoration: none;
    color: black;

    img {
      height: 36px;
      padding: 5px;
    }
    span {
      font-weight: 600;
    }
  }
`;

function useMetaMaskModalStyle(): Modal.Styles {
  const theme = useContext(ThemeContext);

  return {
    content: {
      maxHeight: '95%',
      overflowY: 'auto',
      width: '44rem',
      top: '50%',
      bottom: 'none',
      left: '50%',
      padding: '20px',
      transform: 'translate(-50%, -50%)',
      border: `1px solid ${theme.colors.secondary}`,
      background: theme.colors.primary,
    },
    overlay: {
      zIndex: 6,
      backgroundColor: theme.colors.modalBackground,
    },
  };
}

export default function MetaMaskConnectorButton() {
  const { ethereum } = window;
  const modalStyle = useMetaMaskModalStyle();
  const isMetaMask = !!(ethereum && ethereum.isMetaMask);
  const { activate } = useActiveWeb3React();

  const [open, setOpen] = useState(false);

  const connect = useCallback(() => {
    activate(injected, undefined, true).catch((err) => {
      console.error(`Failed to activate account`, err);
      if (err instanceof NoEthereumProviderError) {
        console.log('is noEthereumProviderError');
      } else if (err instanceof UnsupportedChainIdError) {
        console.log('Wrong network');
      }
    });
  }, [activate]);

  return (
    <WalletOptionWrapper>
      <div onClick={isMetaMask ? connect : () => setOpen(true)}>
        <MetaMaskConnectButton src={mmLogo} alt="Metamask" />
      </div>
      <Modal
        style={modalStyle}
        isOpen={open}
        onRequestClose={() => setOpen(false)}
      >
        <ModalHeader>
          <MMLogo src={mmLogoFox} alt="Metamask" />
          <h2>Install MetaMask to use Rubicon</h2>
          <X
            onClick={() => setOpen(false)} // Click outside the modal should set false as well?
            size={24}
            style={{ marginRight: 5 }}
          />
        </ModalHeader>
        <p>
          MetaMask is a browser extension that will let you use our blockchain
          features in this browser. It may take you a few minutes to set up your
          MetaMask account.
        </p>
        <MetaMaskInstallButton>
          <a
            href={'https://metamask.io/'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MMLogo src={mmLogoFox} alt="Metamask" />
            <span>Install MetaMask</span>
          </a>
        </MetaMaskInstallButton>
      </Modal>
    </WalletOptionWrapper>
  );
}
