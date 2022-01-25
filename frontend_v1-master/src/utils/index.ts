import { getAddress } from 'ethers/lib/utils';
import {
  BaseToken,
  Network,
  TimeHistory,
  TimeHistoryEntry,
  Token,
} from '../types';
import { BigNumber } from '@ethersproject/bignumber';

const ETHERSCAN_PREFIXES: { [chainId: number]: string } = {
  1: '',
  3: 'ropsten.',
  4: 'rinkeby.',
  5: 'goerli.',
  42: 'kovan.',
  69: 'kovan-optimistic.',
};

export function getChainLabel(chain: Network | undefined): string {
  if (chain === undefined) {
    return '';
  } else {
    const NETWORK_LABELS: { [key: number]: string } = {
      [Network.MAINNET]: 'Mainnet',
      [Network.ROPSTEN]: 'Ropsten',
      [Network.RINKEBY]: 'Rinkeby',
      [Network.GOERLI]: 'Görli',
      [Network.KOVAN]: 'Kovan',
      [Network.OPTIMISM_KOVAN]: 'Optimism Kovan',
    };
    return NETWORK_LABELS[chain];
  }
}

export function getEtherscanLink(
  chainId: number,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block',
): string {
  const prefix = `https://${
    ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]
  }etherscan.io`;

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`;
    }
    case 'token': {
      return `${prefix}/token/${data}`;
    }
    case 'block': {
      return `${prefix}/block/${data}`;
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`;
    }
  }
}

export function isAddress(value: any): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

export function findTokenByAddress(
  address: string,
  tokens: Token[],
): Token | undefined {
  return tokens.find((token) =>
    token.addresses.find((a) => a.value === address),
  );
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address);
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}

export function getSortedPrices(prices: { [timestamp: number]: number }) {
  return Object.keys(prices)
    .map((n) => Number(n))
    .sort()
    .map((t) => prices[t]);
}

/**
 * Calculate the percent change of a Token given a start time
 * @return [absolute difference, percent change]
 */
export function getTokenPercentChange(
  token: Token,
  atTimestamp?: number,
  timeHistory: TimeHistory = TimeHistory.ONE_DAY,
): [number, number] {
  return getPercentChange(
    token.prices[timeHistory],
    token.currentPrice,
    atTimestamp,
  );
}

export function getPercentChange(
  entry: TimeHistoryEntry | undefined,
  currentPrice: number,
  atTimestamp?: number,
): [number, number] {
  if (!entry) {
    return [0, 0];
  }

  const base = atTimestamp ? entry[atTimestamp] : getSortedPrices(entry)[0];

  const difference = currentPrice - base;

  if (currentPrice === 0) {
    return [difference, difference === 0 ? 0 : -1];
  }

  return [difference, difference / currentPrice];
}

export function getTokenAddress(token: BaseToken, chainId: number) {
  return token?.addresses.find((t) => t.chainId === chainId)?.value;
}

export function sortBigNumbers(
  a: BigNumber,
  b: BigNumber,
  ascending = true,
): number {
  if (a.sub(b).gt(0)) {
    return ascending ? 1 : -1;
  } else {
    return ascending ? -1 : 1;
  }
}

export function isNumeric(test: string): boolean {
  const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);

  return test === '' || inputRegex.test(escapeRegExp(test));
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function nFormatter(num: number, digits: number = 2) {
  var si = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'K' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  if (i > 0) i--;
  return (
    '$' +
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(num / si[i].value) +
    si[i].symbol
  );
}

export * from './debounce';
export * from './web3';
export * from './hooks';
