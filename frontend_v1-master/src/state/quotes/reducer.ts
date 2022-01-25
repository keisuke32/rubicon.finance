import { createReducer } from '@reduxjs/toolkit';
import { QuoteToken } from '../../types';
import { fetchQuoteList, selectQuoteToken } from './actions';

export interface QuotesState {
  readonly quotes: QuoteToken[];
  readonly selected?: string;
  readonly loading: boolean;
  readonly error?: Error;
}

const initialState: QuotesState = {
  quotes: [],
  selected: undefined,
  loading: true,
  error: undefined,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchQuoteList.pending, (state, action) => {
      return {
        ...state,
        loading: true,
      };
    })
    .addCase(fetchQuoteList.fulfilled, (state, action) => {
      return {
        ...state,
        loading: false,
        error: undefined,
        quotes: action.payload,
      };
    })
    .addCase(fetchQuoteList.rejected, (state, action) => {
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    })
    .addCase(selectQuoteToken, (state, action) => {
      return {
        ...state,
        selected: action.payload,
      };
    }),
);
