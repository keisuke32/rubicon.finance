import { Web3Manager } from '.';
import { markets, pricing, supportedNetworks } from '../config';
import { IToken, Price, Token } from '../database';
import {
  Network,
  Pair,
  PartialRecord,
  TimeHistory,
  TokenPrice,
} from '../types';
import cron from 'node-cron';
import { parseTradeEvent } from '../util';
import { EventData } from 'web3-eth-contract';
import { Server } from 'socket.io';

/**
 * Creates 15 minute interval prices for all the tokens that we have
 */
class PriceManager {
  private priceBook: PartialRecord<
    Network,
    //      Pair<BaseAddr, QuoteAddr>
    { pair: Pair<string, string>; value: number }[]
  >;
  private io?: Server;

  constructor() {
    this.priceBook = {};
  }

  setIo(io: Server) {
    this.io = io;
  }

  private addPrice(
    networkId: Network,
    baseAddress: string,
    quoteAddress: string,
    price: number,
  ) {
    if (!this.priceBook[networkId]) {
      this.priceBook[networkId] = [
        { pair: [baseAddress, quoteAddress], value: price },
      ];
    } else {
      this.priceBook[networkId] = this.priceBook[networkId]?.filter(
        (item) => item.pair[0] !== baseAddress || item.pair[1] !== quoteAddress,
      );
      this.priceBook[networkId]?.push({
        pair: [baseAddress, quoteAddress],
        value: price,
      });
    }
  }

  getCurrentPrice(
    network: Network,
    baseAddress: string,
    quoteAddress: string,
  ): number {
    if (!this.priceBook[network]) {
      return 0.0;
    }

    return (
      this.priceBook[network]?.find(
        (e) => e.pair[0] === baseAddress && e.pair[1] === quoteAddress,
      )?.value || 0
    );
  }

  startFilters() {
    for (const networkId of supportedNetworks) {
      const contract = Web3Manager.getContract(networkId);
      contract?.events.LogTrade().on('data', async (event: EventData) => {
        console.log('Got an event from LogTake');

        const { baseAddress, quoteAddress, price } = await parseTradeEvent(
          event,
        );

        this.addPrice(networkId, baseAddress, quoteAddress, price);
        this.io?.sockets.emit(
          'UPDATE_PRICE',
          networkId,
          baseAddress,
          quoteAddress,
          price,
        );
      });
    }
  }

  init() {
    // TODO: Review this argument, it is not being used
    this.fetchPrices(false); // lets not fetch prices on start up anymore
    this.startFilters();

    cron.schedule(`*/${pricing.intervalInMinutes} * * * *`, async () => {
      const currentTime = new Date();
      console.log('Fetching prices at: ', currentTime.toLocaleTimeString());
      await this.fetchPrices();
      this.io?.send('UPDATE_PRICES', this.priceBook);
      console.log(
        `Finished fetching prices. Took ${
          Date.now() - currentTime.getTime()
        } ms`,
      );
    });
  }

  private async getMostRecentEvent(
    network: Network,
    base: IToken,
    quote: IToken,
  ): Promise<number> {
    const contract = Web3Manager.getContract(network);

    const baseAddress = base.getAddress(network)!;
    const quoteAddress = quote.getAddress(network)!;

    const sells =
      (await contract?.getPastEvents('LogTrade', {
        fromBlock: markets[network]?.blockNumber || 0,
        filter: {
          pay_gem: baseAddress,
          buy_gem: quoteAddress,
        },
      })) || [];

    const buys =
      (await contract?.getPastEvents('LogTrade', {
        fromBlock: markets[network]?.blockNumber || 0,
        filter: {
          buy_gem: baseAddress,
          pay_gem: quoteAddress,
        },
      })) || [];

    let recentEvent = sells.length > 0 ? sells[sells.length - 1] : null;

    if (
      !recentEvent ||
      (buys.length > 0 &&
        buys[buys.length - 1].blockNumber > recentEvent.blockNumber)
    ) {
      recentEvent = buys.length > 0 ? buys[buys.length - 1] : null;
    }

    return recentEvent ? (await parseTradeEvent(recentEvent)).price : 0.0;
  }

  private async fetchPrices(savePrice = true) {
    const tokens = await Token.loadBaseTokens();
    const quotes = await Token.loadQuoteTokens();

    const priceTime = Date.now();

    for (const networkId of supportedNetworks) {
      const bookEntries = this.priceBook[networkId] || [];
      const availableTokens = tokens.filter((t) => t.onNetwork(networkId));
      const availableQuotes = quotes.filter((t) => t.onNetwork(networkId));

      for (const base of availableTokens) {
        for (const quote of availableQuotes) {
          const entry = bookEntries.find(
            (e) =>
              e.pair[0] === base.getAddress(networkId) &&
              e.pair[1] === quote.getAddress(networkId),
          );
          const price = entry
            ? entry.value
            : await this.getMostRecentEvent(networkId, base, quote);

          if (!entry) {
            this.addPrice(
              networkId,
              base.getAddress(networkId),
              quote.getAddress(networkId),
              price,
            );
          }

          new Price({
            baseTicker: base.ticker,
            quoteTicker: quote.ticker,
            chainId: networkId,
            value: price,
            timestamp: priceTime,
          }).save();
        }
      }
    }
  }
}

export const instance = new PriceManager();
