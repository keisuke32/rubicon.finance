import React, { useContext, useState } from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import styled, { ThemeContext } from 'styled-components';
import { AppDispatch } from '../../state';
import { toggleDarkMode } from '../../state/settings/actions';
import { useDarkMode } from '../../state/settings/hooks';
import Toggle from '../Toggle';
import { useActiveWeb3React } from '../../hooks';
import NetworkSettings from '../NetworkSettings';
import { getChainLabel, shortenAddress } from '../../utils';

interface UserSettingsProps {
  isOpen: boolean;
  onRequestClose: () => void;
  closeSettings: () => void;
}

const GroupLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  margin-top: 8px;
  display: inline-block;
`;

const ToggleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  font-weight: 400;
  margin-right: 20px;
  color: ${({ theme }) => theme.text.secondary};
  padding-top: 4px;
  padding-bottom: 2px;
`;

const Button = styled.span`
  cursor: pointer;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.tertiary};
  font-weight: 500;
  // margin-top: 15px;
  font-size: 13px;
`;

export default function (props: UserSettingsProps) {
  const { account, chainId, library } = useActiveWeb3React();
  const theme = useContext(ThemeContext);
  const [networkSettingsOpen, setNetworkSettingsOpen] = useState(false);
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);

  const darkMode = useDarkMode();
  const dispatch = useDispatch<AppDispatch>();
  const chainLabel = getChainLabel(chainId);

  function changeAccount() {
    //This will only work on MetaMask injected provider
    library?.send('wallet_requestPermissions', [{ eth_accounts: {} }, account]);
  }

  // async function getAddr() {
  //   return shortenAddress(String(await account!));
  //   // return account;
  // }

  const modalStyle: Modal.Styles = {
    content: {
      overflowY: 'auto',
      left: '10px',
      bottom: '68px',
      top: 'none',
      right: 'none',
      border: `1px solid ${theme.colors.secondary}`,
      background: theme.colors.secondary,
    },
    overlay: {
      zIndex: 2,
      background: 'none',
    },
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onRequestClose={props.onRequestClose}
      style={modalStyle}
    >
      <GroupLabel>Display</GroupLabel>
      <ToggleWrapper>
        <ToggleLabel>Toggle Dark Mode</ToggleLabel>
        <Toggle isActive={darkMode} toggle={() => dispatch(toggleDarkMode())} />
      </ToggleWrapper>
      <GroupLabel>Network</GroupLabel>
      <ToggleWrapper>
        <ToggleLabel>{chainLabel}</ToggleLabel>
        <Button onClick={() => setNetworkSettingsOpen(true)}>Change</Button>
      </ToggleWrapper>
      <ToggleWrapper>
        <ToggleLabel>Wallet</ToggleLabel>
        <Button onClick={props.closeSettings}>Disconnect</Button>
      </ToggleWrapper>
      <ToggleWrapper>
        <ToggleLabel>
          {account?.substr(0, 6) + '...' + account?.substr(account?.length - 4)}
        </ToggleLabel>
        <Button onClick={() => changeAccount()}>Change</Button>
      </ToggleWrapper>
      <NetworkSettings
        isOpen={networkSettingsOpen}
        setIsOpen={setNetworkSettingsOpen}
        onRequestClose={() => setNetworkSettingsOpen(false)}
      />
    </Modal>
  );
}
