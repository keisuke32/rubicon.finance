import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { Network } from '../types';

export const optimismKovanParams = {
  chainId: `0x${Network.OPTIMISM_KOVAN.toString(16)}`,
  chainName: 'Optimism Kovan',
  nativeCurrency: {
    name: 'Optimism ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://kovan.optimism.io'],
  blockExplorerUrls: ['https://kovan-explorer.optimism.io/'],
};

export const validNetworks = [Network.KOVAN, Network.OPTIMISM_KOVAN];

const RPC_URLS = {
  [Network.MAINNET]:
    'https://mainnet.infura.io/v3/c7c4543c849a4d8d96b0fedeb8bb273c',
  [Network.RINKEBY]:
    'https://rinkeby.infura.io/v3/bd80ce1ca1f94da48e151bb6868bb150', //these are not ours
  [Network.KOVAN]:
    'https://kovan.infura.io/v3/c7c4543c849a4d8d96b0fedeb8bb273c',
  [Network.OPTIMISM_KOVAN]: 'https://kovan.optimism.io/',
};

export const injected = new InjectedConnector({
  supportedChainIds: [Network.MAINNET, Network.KOVAN, Network.OPTIMISM_KOVAN],
});

export const walletLink = new WalletLinkConnector({
  url: RPC_URLS[Network.KOVAN],
  appLogoUrl: 'https://app.rubicon.finance/logo.png',
  appName: 'Rubicon',
});

export const walletConnect = new WalletConnectConnector({
  rpc: {
    [Network.MAINNET]: RPC_URLS[Network.MAINNET],
    [Network.KOVAN]: RPC_URLS[Network.KOVAN],
    [Network.OPTIMISM_KOVAN]: RPC_URLS[Network.OPTIMISM_KOVAN],
  },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
});

// Bug fix for walletConnect - https://github.com/NoahZinsmeister/web3-react/issues/124
// Keep track of this issue in order to remove this once is fixed on the package
export const resetWalletConnector = (connector: AbstractConnector) => {
  if (
    connector &&
    connector instanceof WalletConnectConnector &&
    connector.walletConnectProvider?.wc?.uri
  ) {
    connector.walletConnectProvider = undefined;
  }
};
