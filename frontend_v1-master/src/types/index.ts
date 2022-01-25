import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';

export enum Network {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5,
  KOVAN = 42,
  OPTIMISM_KOVAN = 69,
}

export enum TimeHistory {
  ONE_DAY = '1 day|1d',
  ONE_WEEK = '1 week|1w',
  ONE_MONTH = '1 month|1m',
  THREE_MONTHS = '3 months|3m',
  ALL_TIME = 'all|all',
}

export type Pair<B, Q> = [B, Q];

export type TimeHistoryEntry = {
  [timestamp: number]: number;
};

export type TokenPrice = {
  [key in TimeHistory]?: TimeHistoryEntry;
};

export interface TokenTrade {
  baseAmount: number;
  price: number;
}

export interface BaseToken {
  ticker: string;
  name: string;
  precision: number;
  logo?: string;
  description?: string;
  addresses: { chainId: number; value: string }[];
}

export interface QuoteToken extends BaseToken {}

export interface Token extends BaseToken {
  currentPrice: number;
  prices: TokenPrice;
  asks: TokenTrade[];
  bids: TokenTrade[];
}

export interface QuoteUserToken extends QuoteToken {
  quantity: number;
  currentPrice: number;
}

export interface UserToken extends Token {
  quantity: number;
}

export type PortfolioData = TokenPrice;

export type UserTrade = {
  id: string;
  isBuy: boolean;
  payGem: string;
  buyGem: string;
  payAmount: number;
  buyAmount: number;
  completed: boolean;
  killed: boolean;
  timestamp: number;
  transactionHash: string;
};

export type UserTrades = {
  [ticker: string]: {
    trades: UserTrade[];
    balance: number;
  };
};

export interface ContractOffer {
  payAmount: BigNumber;
  payGem: string;
  buyAmount: BigNumber;
  buyGem: string;
  baseAddress: string;
  baseAmount: BigNumber;
  quoteAddress: string;
  quoteAmount: BigNumber;
  id: number;
  price: number; // baseAmount / quoteAmount
}

export type PoolProps = {
  token: BaseToken;
  contract: Contract | null;
  growth?: number;
  poolBalance: BigNumber;
};
