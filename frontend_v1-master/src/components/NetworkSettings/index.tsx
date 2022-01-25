import React, { useContext, useEffect, useState } from 'react';
import Modal from 'react-modal';
import styled, { ThemeContext } from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import { validNetworks, optimismKovanParams } from '../../connectors';

Modal.setAppElement('#root');

interface NetworkSettingsProps {
  isOpen: boolean;
  setIsOpen: (set: boolean) => void;
  onRequestClose: () => void;
}

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
`;

const NetworkHeader = styled.h2`
  margin: auto;
`;

const NetworkInstructionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  p {
    padding: 0 0 0 20px;
  }
  h3 {
    margin: 0 0 10px 0;
  }
`;

const CP = styled.p`
  text-align: center;
`;

const NetworkOption = styled.div`
  padding: 10px 30px;
  border-radius: 5px;
  color: ${({ theme }) => theme.text.againstRed};
  background-color: ${({ theme }) => theme.colors.tertiary};
  cursor: pointer;
  &:hover {
    opacity: 0.7;
  }
`;

export default function (props: NetworkSettingsProps) {
  const theme = useContext(ThemeContext);
  const { chainId, library, account, active } = useActiveWeb3React();

  const [wrongNetwork, setWrongNetwork] = useState(false);

  useEffect(() => {
    if (chainId && !validNetworks.includes(chainId) && active) {
      setWrongNetwork(true);
      props.setIsOpen(true);
    } else {
      setWrongNetwork(false);
      props.setIsOpen(false);
    }
  }, [chainId, active]);

  const modalStyle: Modal.Styles = {
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
      zIndex: 2,
      backgroundColor: theme.colors.modalBackground,
    },
  };

  function changeNetwork() {
    //This will only work on MetaMask injected provider
    library?.send('wallet_addEthereumChain', [optimismKovanParams, account]);
  }

  return (
    <Modal
      isOpen={props.isOpen}
      onRequestClose={wrongNetwork ? () => null : props.onRequestClose}
      style={modalStyle}
    >
      <ModalHeader>
        {wrongNetwork ? (
          <NetworkHeader>Wrong network, please connect to Kovan</NetworkHeader>
        ) : (
          <NetworkHeader>Select a Network</NetworkHeader>
        )}
      </ModalHeader>
      <CP>
        Currently Rubicon only supports the Kovan and Optimism Kovan test
        networks. Please follow the instructions below to change your wallet to
        one of the supported networks.
      </CP>
      <NetworkInstructionWrapper>
        <h3>Kovan</h3>
        <ul>
          <li>Open your MetaMask extension</li>
          <li>Click on the connected network on the top of the navigation.</li>
          <li>Select Kovan network.</li>
        </ul>
      </NetworkInstructionWrapper>
      <NetworkInstructionWrapper>
        <h3>Optimism Kovan</h3>
        <p>
          {/* If you want to connect straight to the Layer 2 Optimism Kovan network,
          click on the button bellow. */}
        </p>
        <NetworkOption onClick={() => changeNetwork()}>
          Connect to Optimism Kovan
        </NetworkOption>
        {/* <ul>
          <li>
            Your MetaMask extension will request your approval to add a custom
            network. Press "Approve" to add the new network to your wallet.
          </li>
          <li>
            Once you have added the new network, MetaMask will prompt you again
            and request you to switch to the new network. Press "Switch Network"
            to proceed.
          </li>
        </ul> */}
      </NetworkInstructionWrapper>
    </Modal>
  );
}
