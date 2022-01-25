import { createReducer } from '@reduxjs/toolkit';
import { UserTrades } from '../../types';
import { fetchUserTrades } from './actions';

export interface TradesState {
  readonly trades: UserTrades;
  readonly loading: boolean;
  readonly error?: Error;
}

const initialState: TradesState = {
  trades: {},
  loading: true,
  error: undefined,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchUserTrades.pending, (state, action) => {
      return {
        ...state,
        loading: true,
      };
    })
    .addCase(fetchUserTrades.fulfilled, (state, action) => {
      return {
        ...state,
        loading: false,
        trades: action.payload,
        error: undefined,
      };
    })
    .addCase(fetchUserTrades.rejected, (state, action) => {
      return {
        ...state,
        loading: false,
        error: action.payload,
        trades: {},
      };
    }),
);
