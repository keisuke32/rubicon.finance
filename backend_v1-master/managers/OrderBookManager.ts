import { Web3Manager } from '.';
import { markets, supportedNetworks } from '../config';
import { CompleteOrderBook, Network, OpenTrade, OrderBook } from '../types';
import { EventData } from 'web3-eth-contract';
import { formatERC20Amount, parseTradeEvent } from '../util';
import { Token } from '../database';
import { Contract } from 'web3-eth-contract';
import { Server } from 'socket.io';

const DEFAULT_ORDER_BOOK: OrderBook = {
  buys: [],
  sells: [],
};

/**
 * Manage order book on ChainID -> Base/Quote pair -> Bids/Asks
 */
class OrderBookManager {
  private orderBook: CompleteOrderBook;
  private io?: Server;
  constructor() {
    this.orderBook = supportedNetworks.reduce<CompleteOrderBook>(
      (prev, next) => ({ ...prev, [next]: {} }),
      {},
    );
  }

  setIo(io: Server) {
    this.io = io;
  }

  getOrderBook(
    network: Network,
    baseAddress: string,
    quoteAddress: string,
  ): OrderBook {
    const key = `${baseAddress}-${quoteAddress}`;
    return this.orderBook[network]![key] || DEFAULT_ORDER_BOOK;
  }

  async loadTrade(contract: Contract, id: string): Promise<OpenTrade> {
    const offer = (await contract.methods.getOffer(id).call()) as Record<
      string,
      string
    >;
    const payAddress = offer['1'];
    const payAmount = await formatERC20Amount(payAddress, offer['0']);
    const buyAddress = offer['3'];
    const buyAmount = await formatERC20Amount(buyAddress, offer['2']);
    const isBuy = await Token.isQuoteToken(payAddress);

    const price = (isBuy
      ? payAmount.div(buyAmount)
      : buyAmount.div(payAmount)
    ).toNumber();

    return {
      baseAddress: isBuy ? buyAddress : payAddress,
      baseAmount: (isBuy ? buyAmount : payAmount).toNumber(),
      quoteAddress: isBuy ? payAddress : buyAddress,
      quoteAmount: (isBuy ? payAmount : buyAmount).toNumber(),
      price,
      id,
      isBuy, // this will be useless, so no need to calculate it (Verify this)
    };
  }

  /**
   * Load the open trades for a token pair
   * @param pay address of the pay gem
   * @param buy address of the buy gem
   */
  async loadTrades(
    contract: Contract,
    pay: string,
    buy: string,
  ): Promise<OpenTrade[]> {
    const orderCount = Number(
      await contract.methods.getOfferCount(pay, buy).call(),
    );
    let trades: OpenTrade[] = [];
    if (orderCount === 0) {
      return trades;
    }

    let lastId = await contract.methods.getBestOffer(pay, buy).call();
    trades.push(await this.loadTrade(contract, lastId));
    for (let i = 1; i < orderCount; i++) {
      lastId = await contract.methods.getWorseOffer(lastId).call();
      trades.push(await this.loadTrade(contract, lastId));
    }
    return trades;
  }

  async createPairEntry(
    contract: Contract,
    base: string,
    quote: string,
    networkId: Network,
  ) {
    const buys = await this.loadTrades(contract, quote, base);
    const sells = await this.loadTrades(contract, base, quote);

    const key = `${base}-${quote}`;
    this.orderBook[networkId]![key] = {
      buys,
      sells,
    };
  }

  async createInitialOrderBook() {
    const tokens = await Token.loadBaseTokens();
    const quotes = await Token.loadQuoteTokens();
    for (const networkId of supportedNetworks) {
      const contract = Web3Manager.getContract(networkId);
      if (!contract) continue;
      const availableTokens = tokens.filter((t) => t.onNetwork(networkId));
      const availableQuotes = quotes.filter((t) => t.onNetwork(networkId));

      for (const base of availableTokens) {
        for (const quote of availableQuotes) {
          // First, let's get the current buy offers
          // getBestOffer(sell_gem, buy_gem)
          const quoteAddr = quote.getAddress(networkId);
          const baseAddr = base.getAddress(networkId);

          await this.createPairEntry(contract, baseAddr, quoteAddr, networkId);
        }
      }
    }
  }

  async handleContractEvent(
    event: EventData,
    networkId: Network,
    contract: Contract,
  ) {
    const tradeEvent = await parseTradeEvent(event);
    console.log('Got event:', event.event);
    await this.createPairEntry(
      contract,
      tradeEvent.baseAddress,
      tradeEvent.quoteAddress,
      networkId,
    );

    const key = `${tradeEvent.baseAddress}-${tradeEvent.quoteAddress}`;

    this.io?.sockets.emit(
      'UPDATE_ORDER_BOOK',
      networkId,
      tradeEvent.baseAddress,
      tradeEvent.quoteAddress,
      this.orderBook[networkId]![key],
    );
  }

  init() {
    this.createInitialOrderBook();

    for (const networkId of supportedNetworks) {
      const contract = Web3Manager.getContract(networkId);
      contract?.events
        .LogMake({ fromBlock: markets[networkId]?.blockNumber })
        .on('data', (data: EventData) =>
          this.handleContractEvent(data, networkId, contract),
        );
      contract?.events
        .LogTake({ fromBlock: markets[networkId]?.blockNumber })
        .on('data', (data: EventData) =>
          this.handleContractEvent(data, networkId, contract),
        );
      contract?.events
        .LogKill({ fromBlock: markets[networkId]?.blockNumber })
        .on('data', (data: EventData) =>
          this.handleContractEvent(data, networkId, contract),
        );
    }
  }
}

export const instance = new OrderBookManager();
