import { Document, Model, model, Schema } from 'mongoose';
import { DEFAULT_PRECISION } from '../../config';
import { Network } from '../../types';

export interface IToken {
  ticker: string;
  name: string;
  logo?: string;
  description?: string;
  isQuote: boolean;
  precision: number;
  addresses: { chainId: number; value: string }[];
  onNetwork: (network: Network) => boolean;
  getAddress: (network: Network) => string;
  toObject: () => IToken;
}

const tokenSchema = new Schema({
  ticker: { type: String, required: true },
  name: { type: String, required: true },
  logo: { type: String, required: false },
  description: { type: String, required: false },
  isQuote: { type: Boolean, required: true, default: false },
  precision: { type: Number, required: true, default: DEFAULT_PRECISION },
  addresses: [{ chainId: Number, value: String }],
});

tokenSchema.methods.onNetwork = function (network: Network): boolean {
  return !!this.getAddress(network);
};

tokenSchema.methods.getAddress = function (
  network: Network,
): string | undefined {
  return this.addresses.find(
    (address: { chainId: Number }) => address.chainId === network,
  )?.value;
};

tokenSchema.statics.loadQuoteTokens = async function (): Promise<IToken[]> {
  const quotes = await this.find({ isQuote: true });
  return quotes;
};

tokenSchema.statics.loadBaseTokens = async function (): Promise<IToken[]> {
  const bases = await this.find({ isQuote: false });
  return bases;
};

tokenSchema.statics.loadBaseTokensByNetwork = async function (
  network: Network,
): Promise<IToken[]> {
  const bases = await this.find({
    isQuote: false,
    'addresses.chainId': network,
  });
  return bases;
};

tokenSchema.statics.loadQuoteTokensByNetwork = async function (
  network: Network,
): Promise<IToken[]> {
  const bases = await this.find({
    isQuote: true,
    'addresses.chainId': network,
  });
  return bases;
};

tokenSchema.statics.findTokenByAddress = async function (
  address: string,
): Promise<IToken> {
  return await this.findOne({
    'addresses.value': { $regex: `^${address}$`, $options: 'i' },
  });
};

tokenSchema.statics.isQuoteToken = async function (
  address: string,
): Promise<boolean> {
  const item = await this.findOne({
    isQuote: true,
    'addresses.value': { $regex: `^${address}$`, $options: 'i' },
  });
  return !!item;
};

tokenSchema.statics.findQuoteToken = async function (
  ticker: string,
  networkId?: number,
): Promise<IToken> {
  let args: {
    isQuote: boolean;
    ticker: string;
    'addresses.chainId'?: number;
  } = {
    isQuote: true,
    ticker,
  };
  if (!!networkId) {
    args['addresses.chainId'] = networkId;
  }
  return await this.findOne(args);
};

tokenSchema.statics.findToken = async function (
  ticker: string,
): Promise<IToken> {
  return await this.findOne({ isQuote: false, ticker });
};

type TokenDocument = IToken & Document;

interface TokenModel extends Model<TokenDocument> {
  loadQuoteTokens(): Promise<IToken[]>;
  loadBaseTokens(): Promise<IToken[]>;
  loadBaseTokensByNetwork(network: Network): Promise<IToken[]>;
  loadQuoteTokensByNetwork(network: Network): Promise<IToken[]>;
  findQuoteToken(ticker: string, networkId?: number): Promise<IToken>;
  findToken(ticker: string): Promise<IToken>;
  isQuoteToken(address: string): Promise<boolean>;
  findTokenByAddress(address: string): Promise<IToken>;
}

export const Token = model<TokenDocument, TokenModel>('Token', tokenSchema);
