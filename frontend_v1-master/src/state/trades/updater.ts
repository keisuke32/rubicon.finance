import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '..';
import { fetchUserTrades } from './actions';
import { Contract, Event } from '@ethersproject/contracts';
import { formatUnits, solidityKeccak256 } from 'ethers/lib/utils';
import { BigNumber } from '@ethersproject/bignumber';
import { useIsTokenPending, useTokens } from '../tokens/hooks';
import { useSelectedQuote } from '../quotes/hooks';
import { useActiveWeb3React } from '../../hooks';
import { useMarketContract } from '../../hooks/contract';
import { useTokenBalances } from '../../hooks/wallet';
import { getTokenAddress } from '../../utils';
import { QuoteToken, Token, UserTrade, UserTrades } from '../../types';
import { markets } from '../../config';
import { useUserTrades } from './hooks';

export default function (): null {
  const dispatch = useDispatch<AppDispatch>();

  const tokens = useTokens();
  const tokensLoading = useIsTokenPending();
  const quote = useSelectedQuote();
  const { chainId, account } = useActiveWeb3React();
  const contract = useMarketContract();
  const userTrades = useUserTrades();
  const [balances, balancesLoading] = useTokenBalances();

  useEffect(() => {
    if (
      tokensLoading ||
      !quote ||
      !contract ||
      !account ||
      !chainId ||
      balancesLoading
    )
      return;
    if (!Object.keys(userTrades).length) dispatch(fetchUserTrades.pending());
    const fetchData = async () => {
      // Loop through each token
      const quoteAddress = getTokenAddress(quote, chainId)!;
      const results: UserTrades = {};
      for (const token of tokens) {
        const tokenAddress = getTokenAddress(token, chainId)!;
        results[token.ticker] = {
          trades: await loadUserHistoricTrade(
            token,
            quote,
            account,
            chainId,
            contract,
          ),
          balance: balances[token.ticker]?.toNumber() || 0,
        };
      }
      dispatch(fetchUserTrades.fulfilled(results));
    };
    fetchData();
  }, [balances, tokensLoading, quote, account, chainId]);

  return null;
}

async function loadUserHistoricTrade(
  token: Token,
  quote: QuoteToken,
  account: string,
  chainId: number,
  contract: Contract,
): Promise<UserTrade[]> {
  const tokenAddress = getTokenAddress(token, chainId)!;
  const quoteAddress = getTokenAddress(quote, chainId)!;
  // Pair form: <pay_gem><buy_gem>
  const sellPair =
    tokenAddress && quoteAddress
      ? solidityKeccak256(['address', 'address'], [tokenAddress, quoteAddress])
      : null;
  const buyPair =
    tokenAddress && quoteAddress
      ? solidityKeccak256(['address', 'address'], [quoteAddress, tokenAddress])
      : null;
  const mapKillToId = (events: Event[]) => {
    return events.map<string>((ev) => ev.args!['id'] as string);
  };

  const mapMakeToUserTrade = (
    events: Event[],
    isBuy: boolean,
    killedIds: string[],
  ) => {
    return events.map<UserTrade>((ev) => ({
      id: ev.args!['id'] as string,
      isBuy,
      completed: false,
      killed: killedIds.includes(ev.args!['id']),
      payGem: isBuy ? quote.ticker : token.ticker,
      buyGem: isBuy ? token.ticker : quote.ticker,
      payAmount: Number(
        formatUnits(
          ev.args!['pay_amt'] as BigNumber,
          isBuy ? quote.precision : token.precision,
        ),
      ),
      buyAmount: Number(
        formatUnits(
          ev.args!['buy_amt'] as BigNumber,
          isBuy ? token.precision : quote.precision,
        ),
      ),
      timestamp: (ev.args!['timestamp'] as BigNumber).toNumber(),
      transactionHash: ev['transactionHash'] as string,
    }));
  };

  const mapTakeToUserTrade = (
    events: Event[],
    isBuy: boolean,
    isTake: boolean,
  ) => {
    return events.map<UserTrade>((ev) => ({
      id: ev.args!['id'] as string,
      isBuy,
      completed: true,
      killed: false,
      payGem: isBuy ? quote.ticker : token.ticker,
      buyGem: isBuy ? token.ticker : quote.ticker,
      payAmount: Number(
        formatUnits(
          ev.args![isTake ? 'give_amt' : 'take_amt'] as BigNumber,
          isBuy ? quote.precision : token.precision,
        ),
      ),
      buyAmount: Number(
        formatUnits(
          ev.args![isTake ? 'take_amt' : 'give_amt'] as BigNumber,
          isBuy ? token.precision : quote.precision,
        ),
      ),
      timestamp: (ev.args!['timestamp'] as BigNumber).toNumber(),
      transactionHash: ev['transactionHash'] as string,
    }));
  };

  const startingBlock = markets[chainId].blockNumber;

  // isBuy: false
  const sellMakesFilter = contract?.filters.LogTake(
    null,
    sellPair,
    account,
    null,
    null,
    null,
    null,
    null,
    null,
  )!;
  // isBuy: true
  const sellTakesFilter = contract?.filters.LogTake(
    null,
    sellPair,
    null,
    null,
    null,
    account,
    null,
    null,
    null,
  )!;

  // isBuy: true
  const buyMakesFilter = contract?.filters.LogTake(
    null,
    buyPair,
    account,
    null,
    null,
    null,
    null,
    null,
    null,
  )!;
  // isBuy: false
  const buyTakesFilter = contract?.filters.LogTake(
    null,
    buyPair,
    null,
    null,
    null,
    account,
    null,
    null,
    null,
  )!;

  const possibleMakesBuyFilter = contract?.filters.LogMake(
    null,
    buyPair,
    account,
    null,
    null,
    null,
    null,
    null,
  );

  const possibleMakesSellFilter = contract?.filters.LogMake(
    null,
    sellPair,
    account,
    null,
    null,
    null,
    null,
    null,
  );

  const killedBuysFilter = contract?.filters.LogKill(
    null,
    buyPair,
    account,
    null,
    null,
    null,
    null,
    null,
  );

  const killedSellsFilter = contract?.filters.LogKill(
    null,
    sellPair,
    account,
    null,
    null,
    null,
    null,
    null,
  );

  const trades = [
    ...(await contract
      .queryFilter(sellMakesFilter, startingBlock)
      .then((re) => mapTakeToUserTrade(re, false, false))),
    ...(await contract
      .queryFilter(sellTakesFilter, startingBlock)
      .then((re) => mapTakeToUserTrade(re, true, true))),
    ...(await contract
      .queryFilter(buyMakesFilter, startingBlock)
      .then((re) => mapTakeToUserTrade(re, true, false))),
    ...(await contract
      .queryFilter(buyTakesFilter, startingBlock)
      .then((re) => mapTakeToUserTrade(re, false, true))),
  ];

  const killedIds = [
    ...(await contract
      .queryFilter(killedBuysFilter, startingBlock)
      .then((re) => mapKillToId(re))),
    ...(await contract
      .queryFilter(killedSellsFilter, startingBlock)
      .then((re) => mapKillToId(re))),
  ];

  const incompleteTrades = [
    ...(
      await contract
        .queryFilter(possibleMakesSellFilter, startingBlock)
        .then((re) => mapMakeToUserTrade(re, false, killedIds))
    ).filter((item) => !trades.find((trade) => trade.id === item.id)),
    ...(
      await contract
        .queryFilter(possibleMakesBuyFilter, startingBlock)
        .then((re) => mapMakeToUserTrade(re, true, killedIds))
    ).filter((item) => !trades.find((trade) => trade.id === item.id)),
  ];

  return [...trades, ...incompleteTrades];
}
