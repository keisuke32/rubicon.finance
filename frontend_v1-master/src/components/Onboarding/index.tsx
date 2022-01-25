import React, { useContext } from 'react';
import Modal from 'react-modal';
import styled, { ThemeContext } from 'styled-components';
import Loader from '../Loader';
import logo from '../../assets/img/logo-color.png';
import { useWebSocket } from '../SocketProvider';
import MetaMaskConnectorButton from './Metamask';
import WalletConnectConnectorButton from './Walletconnect';
import WalletLinkConnectorButton from './Walletlink';

Modal.setAppElement('#root');

const LogoWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 100%;
  padding: 30px 50px 30px 50px;
  display: flex;
  justify-content: center;
`;

const TextWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 100%;
  padding: 8px 20px 8px 20px;
  text-align: center;
  justify-content: center;
`;

export const WalletOptionWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 100%;
  padding: 20px 50px 20px 50px;
  display: flex;
  justify-content: center;
  div {
    cursor: pointer;
  }
`;

const Logo = styled.img`
  width: 100%;
  height: 100%;
`;

function useModalStyle(): Modal.Styles {
  const theme = useContext(ThemeContext);

  return {
    content: {
      maxHeight: '95%',
      overflowY: 'auto',
      width: '24.5rem',
      top: '50%',
      bottom: 'none',
      left: '50%',
      padding: '0',
      transform: 'translate(-50%, -50%)',
      border: `1px solid ${theme.colors.secondary}`,
      background: theme.colors.primary,
    },
    overlay: {
      zIndex: 5,
      backgroundColor: theme.colors.modalBackground,
    },
  };
}

export default function () {
  const modalStyle = useModalStyle();
  const websocket = useWebSocket();

  function renderModal() {
    if (websocket.loading) {
      return (
        <TextWrapper>
          <Loader size="100px" />
        </TextWrapper>
      );
    } else {
      return (
        <>
          <TextWrapper>
            <h2>Welcome to Rubicon</h2>
            <p>
              To trade on Rubicon and connect to the Ethereum blockchain, please
              connect your wallet.
            </p>
            <MetaMaskConnectorButton />
            <WalletLinkConnectorButton />
            <WalletConnectConnectorButton />
          </TextWrapper>
        </>
      );
    }
  }

  return (
    <Modal isOpen={true} style={modalStyle}>
      <LogoWrapper>
        <Logo src={logo} alt="logo" />
      </LogoWrapper>
      {renderModal()}
    </Modal>
  );
}
