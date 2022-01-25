import { createReducer } from '@reduxjs/toolkit';
import { PortfolioData } from '../../types';
import { fetchPortfolio } from './actions';

export interface PortfolioState {
  readonly data: PortfolioData;
  readonly loading: boolean;
  readonly error?: Error;
}

const initialState: PortfolioState = {
  data: {},
  loading: true,
  error: undefined,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchPortfolio.pending, (state, action) => {
      return {
        ...state,
        loading: true,
      };
    })
    .addCase(fetchPortfolio.fulfilled, (state, action) => {
      return {
        ...state,
        loading: false,
        data: {
          ...state.data,
          [action.payload[0]]: action.payload[1],
        },
        error: undefined,
      };
    })
    .addCase(fetchPortfolio.rejected, (state, action) => {
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    }),
);
