import { Socket } from 'socket.io';
import { Price, Token } from '../../database';
import { OrderBookManager, PriceManager } from '../../managers';
import { TimeHistory, TokenPrice } from '../../types';

export default function listen(socket: Socket) {
  socket.on(
    'LOAD_TIME_HISTORY',
    async (networkId, tokenTicker, quoteTicker, timeHistory, callback) => {
      const token = await Token.findToken(tokenTicker);
      const quoteToken = await Token.findQuoteToken(quoteTicker);
      const currentPrice = PriceManager.getCurrentPrice(
        networkId,
        token.getAddress(networkId),
        quoteToken.getAddress(networkId),
      );

      const priceHistory = await Price.loadPriceHistory(
        networkId,
        tokenTicker,
        quoteTicker,
        timeHistory,
      );

      const result = priceHistory.reduce<TokenPrice>((accum, next) => {
        return {
          ...accum,
          [next.timestamp.getTime()]: next.value,
        };
      }, {});
      result[Date.now()] = currentPrice;

      callback(result);
    },
  );

  socket.on('LOAD_TOKENS', async (networkId, quoteTicker, callback) => {
    const quoteToken = await Token.findQuoteToken(quoteTicker, networkId);
    if (quoteToken == undefined) return;
    const quoteAddress = quoteToken.getAddress(networkId);
    const tokens = await Token.loadBaseTokensByNetwork(networkId);

    const returnValue = await Promise.all(
      tokens.map(async (t) => {
        const currentPrice = PriceManager.getCurrentPrice(
          networkId,
          t.getAddress(networkId),
          quoteAddress,
        );

        const priceHistory = await Price.loadPriceHistory(
          networkId,
          t.ticker,
          quoteTicker,
          TimeHistory.ONE_DAY,
        );
        const orderBook = OrderBookManager.getOrderBook(
          networkId,
          t.getAddress(networkId),
          quoteAddress,
        );

        return {
          ...t.toObject(),
          prices: {
            [TimeHistory.ONE_DAY]: priceHistory.reduce<TokenPrice>(
              (accum, next) => {
                return {
                  ...accum,
                  [next.timestamp.getTime()]: next.value,
                };
              },
              {
                [Date.now()]: currentPrice,
              },
            ),
          },
          bids: orderBook.buys,
          asks: orderBook.sells,
          currentPrice,
        };
      }),
    );
    callback(returnValue);
  });

  socket.on(
    'LOAD_TOKEN_PRICE',
    async (networkId, baseTicker, quoteTicker, timeHistory, callback) => {
      console.log(timeHistory);
    },
  );
}
