import { Network, PartialRecord } from './types';

export const database = {
  host: process.env.MONGODB_HOST || 'cluster-11-11-2020.vbani.mongodb.net',
  user: process.env.MONGODB_USER || 'admin',
  password: process.env.MONGODB_PASSWORD || '40I2wWf6xX7TSVDd',
  port: process.env.MONGODB_PORT || undefined,
  database: process.env.MONGODB_DATABASE || 'rubicon',
  srv: process.env.MONGODB_SRV || 'true',
  authSource: process.env.MONGODB_AUTH_SOURCE || undefined,
};

export const password = 'XK[pvkB4y652}H8';

export const pricing = {
  intervalInMinutes: 15,
};

export const markets: PartialRecord<
  Network,
  { address: string; blockNumber: number }
> = {
  [Network.MAINNET]: {
    address: '0x568538C3c6A8bB6aDc2Bf2bd7620EaA54D37a720',
    blockNumber: 11734016,
  },
  [Network.KOVAN]: {
    address: '0x435fc1B52A3682b6F39a9c408e99BA6573816528',
    blockNumber: 24806623,
  },
  [Network.OPTIMISM_KOVAN]: {
    address: '0x619beC3E00849e48112B162fDa1A6b1f8BC9d18F',
    blockNumber: 226443,
  },
};

export const providers = {
  [Network.KOVAN]:
    'wss://kovan.infura.io/ws/v3/c7c4543c849a4d8d96b0fedeb8bb273c',
  [Network.MAINNET]:
    'wss://mainnet.infura.io/ws/v3/c7c4543c849a4d8d96b0fedeb8bb273c',
  [Network.OPTIMISM_KOVAN]: 'wss://ws-kovan.optimism.io',
};

export const DEFAULT_PRECISION = 18;

export const quoteTickers = ['DAI', 'USDC'];
export const supportedNetworks: Network[] = [
  Network.MAINNET,
  Network.KOVAN,
  Network.OPTIMISM_KOVAN,
];
