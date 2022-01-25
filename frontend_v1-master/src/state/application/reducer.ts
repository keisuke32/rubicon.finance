import { createReducer } from '@reduxjs/toolkit';
import { updateBlockNumber } from './actions';

export interface ApplicationState {
  readonly blockNumber: { [chainId: number]: number };
}

const initialState: ApplicationState = {
  blockNumber: {},
};

export default createReducer(initialState, (builder) =>
  builder.addCase(updateBlockNumber, (state, action) => {
    const { chainId, blockNumber } = action.payload;
    if (typeof state.blockNumber[chainId] !== 'number') {
      return {
        blockNumber: {
          ...state.blockNumber,
          [chainId]: blockNumber,
        },
      };
    } else {
      return {
        blockNumber: {
          ...state.blockNumber,
          [chainId]: Math.max(blockNumber, state.blockNumber[chainId]),
        },
      };
    }
  }),
);
