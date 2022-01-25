import { createReducer } from '@reduxjs/toolkit';
import { UserToken } from '../../types';
import { fetchUserTokenList } from './actions';

export interface UserState {
  readonly tokens: UserToken[];
  readonly loading: boolean;
  readonly error?: Error;
}

const initialState: UserState = {
  tokens: [],
  loading: true,
  error: undefined,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchUserTokenList.pending, (state, action) => {
      return {
        ...state,
        loading: true,
      };
    })
    .addCase(fetchUserTokenList.fulfilled, (state, action) => {
      return {
        ...state,
        loading: false,
        tokens: action.payload,
        error: undefined,
      };
    })
    .addCase(fetchUserTokenList.rejected, (state, action) => {
      return {
        ...state,
        loading: false,
        error: action.payload,
        tokens: [],
      };
    }),
);
