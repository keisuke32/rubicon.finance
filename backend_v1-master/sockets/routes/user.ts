import { Socket } from 'socket.io';
import { Price, Token } from '../../database';
import { PriceManager } from '../../managers';
import { UserTrades, TimeHistoryEntry } from '../../types';
import { stripTime } from '../../util';

export default function listen(socket: Socket) {
  socket.on(
    'LOAD_PORTFOLIO',
    async (
      networkId,
      timeHistory,
      quoteTicker,
      userTrades: UserTrades,
      callback,
    ) => {
      // We must create a linear time scale of the user's portfolio based on their trades. Could get ugly!
      // I am writing this before attempting the solution :)

      const holdingsTo = (
        ticker: string,
        holdings: number,
        timestamp: number,
      ): number => {
        for (const transaction of userTrades[ticker].trades) {
          if (transaction.timestamp >= timestamp && transaction.completed) {
            holdings += transaction.isBuy
              ? -transaction.buyAmount
              : +transaction.payAmount;
          }
        }
        return holdings;
      };

      const now = Date.now();
      const entry: TimeHistoryEntry = { [now]: 0 };

      for (const ticker of Object.keys(userTrades)) {
        const token = await Token.findToken(ticker);
        const quoteToken = await Token.findQuoteToken(quoteTicker);
        const currentPrice = PriceManager.getCurrentPrice(
          networkId,
          token.getAddress(networkId),
          quoteToken.getAddress(networkId),
        );

        const priceHistory = await Price.loadPriceHistory(
          networkId,
          ticker,
          quoteTicker,
          timeHistory,
        );

        entry[now] += currentPrice * userTrades[ticker].balance;
        const cache: { [x: number]: number } = {}; // Figure out why we need this. There's duplicate data for some reason

        for (const price of priceHistory) {
          const time = stripTime(price.timestamp);
          if (time in cache) continue;
          const holdings = holdingsTo(ticker, userTrades[ticker].balance, time);
          const totalValue = holdings * price.value;
          if (time in entry) {
            entry[time] += totalValue;
          } else {
            entry[time] = totalValue;
          }
          cache[time] = 1;
        }
      }

      callback(entry);
    },
  );
}
