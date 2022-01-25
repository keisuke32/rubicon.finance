export enum Network {
  MAINNET = 1,
  KOVAN = 42,
  OPTIMISM_KOVAN = 69,
}

export type Pair<B, Q> = [B, Q];

export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

export enum TimeHistory {
  ONE_DAY = '1 day|1d',
  ONE_WEEK = '1 week|1w',
  ONE_MONTH = '1 month|1m',
  THREE_MONTHS = '3 months|3m',
  ALL_TIME = 'all|all',
}

export type TimeHistoryEntry = {
  [timestamp: number]: number;
};

export type TokenPrice = {
  [timestamp: number]: number;
};

export interface TradeEvent {
  baseAddress: string;
  quoteAddress: string;
  isBuy: boolean;
  baseAmount: number;
  quoteAmount: number;
  price: number;
}

export interface OpenTrade extends TradeEvent {
  id: string;
}

export type OrderBook = {
  buys: OpenTrade[];
  sells: OpenTrade[];
};

export type CompleteOrderBook = PartialRecord<
  Network,
  Record<
    string, // "BaseAddress - QuoteAddress"
    OrderBook
  >
>;

export type UserTrade = {
  id: string;
  isBuy: boolean;
  payGem: string;
  buyGem: string;
  completed: boolean;
  killed: boolean;
  payAmount: number;
  buyAmount: number;
  timestamp: number;
};

export type UserTrades = {
  [ticker: string]: {
    trades: UserTrade[];
    balance: number;
  };
};
