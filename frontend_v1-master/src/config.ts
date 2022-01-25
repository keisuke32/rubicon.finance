import { BaseToken, Network } from './types';

export const websocket = {
  url:
    process.env.NODE_ENV === 'production'
      ? 'https://data.rubicon.finance'
      : 'localhost:3000',
};

export const DEFAULT_CHAIN = Network.KOVAN;

export const LIQUIDITY_PROVIDER_FEE = 0.002;

export const FAUCET_ENABLED_IDS = [42, 69];

export const markets: Record<number, { address: string; blockNumber: number }> =
  {
    [Network.MAINNET]: {
      address: '0x568538C3c6A8bB6aDc2Bf2bd7620EaA54D37a720',
      blockNumber: 11734016,
    },
    [Network.KOVAN]: {
      address: '0x435fc1B52A3682b6F39a9c408e99BA6573816528',
      blockNumber: 20875039,
    },
    [Network.OPTIMISM_KOVAN]: {
      address: '0x619beC3E00849e48112B162fDa1A6b1f8BC9d18F',
      blockNumber: 1, // TODO: Check!
    },
  };

export const bathPools: BaseToken[] = [
  {
    ticker: 'USDC',
    name: 'USDCoin',
    precision: 18,
    addresses: [
      {
        chainId: Network.OPTIMISM_KOVAN,
        value: '0x3c248fe600A8921A75EF92955344DD8C9E1e6057',
      },
    ],
  },
  {
    ticker: 'WAYNE',
    name: 'Wayne Enterprises',
    precision: 18,
    addresses: [
      {
        chainId: Network.OPTIMISM_KOVAN,
        value: '0xe132b6b75db978575d03F3513488Dfad172aE787',
      },
    ],
  },
];

export const supportedNetworks: Network[] = [
  // Network.MAINNET,
  Network.KOVAN,
  Network.OPTIMISM_KOVAN,
];
