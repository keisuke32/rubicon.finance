import BigNumber from 'bignumber.js';
import { EventData } from 'web3-eth-contract';
import { DEFAULT_PRECISION } from '../config';
import { Token } from '../database';
import { TradeEvent } from '../types';

export async function formatERC20Amount(
  address: string,
  price: string,
): Promise<BigNumber> {
  const token = await Token.findTokenByAddress(address);
  const precision = token?.precision || DEFAULT_PRECISION;
  return new BigNumber(price).shiftedBy(-precision);
}

export function stripTime(timestamp: Date): number {
  timestamp.setMilliseconds(0);
  timestamp.setSeconds(0);
  return timestamp.getTime();
}

export async function parseTradeEvent(event: EventData): Promise<TradeEvent> {
  const isBuy = await Token.isQuoteToken(event.returnValues['pay_gem']);

  const baseAddress = isBuy
    ? event.returnValues['buy_gem']
    : event.returnValues['pay_gem'];
  const quoteAddress = isBuy
    ? event.returnValues['pay_gem']
    : event.returnValues['buy_gem'];

  const baseAmount = await formatERC20Amount(
    baseAddress,
    event.returnValues[isBuy ? 'buy_amt' : 'pay_amt'],
  );
  const quoteAmount = await formatERC20Amount(
    quoteAddress,
    event.returnValues[isBuy ? 'pay_amt' : 'buy_amt'],
  );

  const price = quoteAmount.div(baseAmount).toNumber();

  return {
    isBuy,
    baseAddress,
    quoteAddress,
    baseAmount: baseAmount.toNumber(),
    quoteAmount: quoteAmount.toNumber(),
    price,
  };
}
