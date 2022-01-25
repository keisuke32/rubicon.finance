import { createReducer } from '@reduxjs/toolkit';
import { TimeHistory, Token } from '../../types';
import {
  fetchTokenList,
  fetchTokenTimeHistory,
  selectTimeHistory,
  selectToken,
  selectHistory,
  deselectHistory,
  updateOrderBook,
  updatePrice,
} from './actions';

export interface TokensState {
  readonly tokens: Token[];
  readonly selected?: string;
  readonly historyAll: boolean;
  readonly loading: boolean;
  readonly error?: Error;
  readonly selectedTimeHistory: TimeHistory;
  readonly timeHistoryLoading: boolean;
}

const initialState: TokensState = {
  tokens: [],
  selected: undefined,
  historyAll: false,
  loading: true,
  error: undefined,
  selectedTimeHistory: TimeHistory.ONE_DAY,
  timeHistoryLoading: false,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchTokenList.pending, (state, action) => {
      return {
        ...state,
        loading: true,
      };
    })
    .addCase(fetchTokenList.fulfilled, (state, action) => {
      return {
        ...state,
        loading: false,
        error: undefined,
        tokens: action.payload,
      };
    })
    .addCase(fetchTokenList.rejected, (state, action) => {
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    })
    .addCase(selectToken, (state, action) => {
      return {
        ...state,
        historyAll: false,
        selected: action.payload,
      };
    })
    .addCase(selectHistory, (state, action) => {
      return {
        ...state,
        historyAll: true,
      };
    })
    .addCase(deselectHistory, (state, action) => {
      return {
        ...state,
        historyAll: false,
      };
    })
    .addCase(selectTimeHistory, (state, action) => {
      return {
        ...state,
        selectedTimeHistory: action.payload,
      };
    })
    .addCase(fetchTokenTimeHistory.pending, (state, action) => {
      return {
        ...state,
        timeHistoryLoading: true,
      };
    })
    .addCase(fetchTokenTimeHistory.fulfilled, (state, action) => {
      return {
        ...state,
        timeHistoryLoading: false,
        tokens: state.tokens.map((t) =>
          t.ticker === state.selected
            ? {
                ...t,
                prices: {
                  ...t.prices,
                  [state.selectedTimeHistory]: action.payload,
                },
              }
            : t,
        ),
      };
    })
    .addCase(fetchTokenTimeHistory.rejected, (state, action) => {
      return {
        ...state,
        timeHistoryLoading: false,
      };
    })
    .addCase(updateOrderBook, (state, action) => {
      const token = action.payload[0];
      return {
        ...state,
        tokens: state.tokens.map((t) =>
          t.ticker === token.ticker
            ? {
                ...t,
                bids: action.payload[1].buys,
                asks: action.payload[1].sells,
              }
            : t,
        ),
      };
    })
    .addCase(updatePrice, (state, action) => {
      const token = action.payload[0];
      const price = action.payload[1];
      return {
        ...state,
        tokens: state.tokens.map((t) =>
          t.ticker === token.ticker
            ? {
                ...t,
                currentPrice: price,
                prices: Object.keys(t.prices).reduce((accum, next) => {
                  const val = next as TimeHistory;
                  return {
                    ...accum,
                    [val]: {
                      ...t.prices[val],
                      [Date.now()]: price,
                    },
                  };
                }, {}),
              }
            : t,
        ),
      };
    }),
);
