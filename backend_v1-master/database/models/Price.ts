import { Document, Model, model, Schema } from 'mongoose';
import { Network, TimeHistory, TokenPrice } from '../../types';

export interface IPrice {
  baseTicker: string;
  quoteTicker: string;
  chainId: number;
  value: number;
  timestamp: Date;
}

const priceSchema = new Schema({
  baseTicker: { type: String, required: true },
  quoteTicker: { type: String, required: true },
  chainId: { type: Number, required: true },
  value: { type: Number, required: true },
  timestamp: { type: Date, required: true },
});

priceSchema.statics.loadPriceHistory = async function (
  network: Network,
  baseTicker: string,
  quoteTicker: string,
  timeHistory: TimeHistory,
): Promise<IPrice[]> {
  let query: Record<any, any> = { baseTicker, quoteTicker, chainId: network };
  if (timeHistory === TimeHistory.ONE_DAY) {
    return await this.find({
      ...query,
      timestamp: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
  } else if (timeHistory === TimeHistory.ONE_WEEK) {
    return await this.aggregate([
      {
        $match: {
          timestamp: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          ...query,
        },
      },
      {
        $project: {
          h: { $hour: '$timestamp' },
          d: { $dayOfMonth: '$timestamp' },
          original_doc: '$$ROOT',
        },
      },
      {
        $group: {
          _id: { day: '$d', hour: '$h' },
          docs: { $push: '$original_doc' },
        },
      },
      {
        $replaceRoot: {
          newRoot: { $arrayElemAt: ['$docs', 0] },
        },
      },
    ]);
  } else if (timeHistory === TimeHistory.ONE_MONTH) {
    return await this.aggregate([
      {
        $match: {
          timestamp: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          ...query,
        },
      },
      {
        $project: {
          h: { $hour: '$timestamp' },
          d: { $dayOfMonth: '$timestamp' },
          m: { $month: '$timestamp' },
          original_doc: '$$ROOT',
        },
      },
      {
        $match: {
          h: { $in: [3, 7, 11] },
        },
      },
      {
        $group: {
          _id: { month: '$m', day: '$d', hour: '$h' },
          docs: { $push: '$original_doc' },
        },
      },
      {
        $replaceRoot: {
          newRoot: { $arrayElemAt: ['$docs', 0] },
        },
      },
    ]);
  } else {
    return await this.aggregate([
      {
        $match: {
          timestamp: {
            $gt:
              timeHistory === TimeHistory.THREE_MONTHS
                ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                : new Date(0),
          },
          ...query,
        },
      },
      {
        $project: {
          h: { $hour: '$timestamp' },
          d: { $dayOfMonth: '$timestamp' },
          m: { $month: '$timestamp' },
          original_doc: '$$ROOT',
        },
      },
      {
        $match: {
          h: { $in: [12] },
        },
      },
      {
        $group: {
          _id: { month: '$m', day: '$d', hour: '$h' },
          docs: { $push: '$original_doc' },
        },
      },
      {
        $replaceRoot: {
          newRoot: { $arrayElemAt: ['$docs', 0] },
        },
      },
    ]);
  }
};

type PriceDocument = IPrice & Document;

interface PriceModel extends Model<PriceDocument> {
  loadPriceHistory(
    network: Network,
    baseTicker: string,
    quoteTicker: string,
    timeHistory: TimeHistory,
  ): Promise<IPrice[]>;
}

export const Price = model<PriceDocument, PriceModel>('Price', priceSchema);
