import {
  ActionCreatorWithoutPayload,
  ActionCreatorWithPayload,
  createAction,
} from '@reduxjs/toolkit';
import { TimeHistory, TimeHistoryEntry, Token, TokenTrade } from '../../types';

export const fetchTokenList: Readonly<{
  pending: ActionCreatorWithoutPayload;
  fulfilled: ActionCreatorWithPayload<Token[]>;
  rejected: ActionCreatorWithPayload<Error>;
}> = {
  pending: createAction('tokens/fetchTokenList/pending'),
  fulfilled: createAction('tokens/fetchTokenList/fulfilled'),
  rejected: createAction('tokens/fetchTokenList/rejected'),
};

export const fetchTokenTimeHistory: Readonly<{
  pending: ActionCreatorWithoutPayload;
  fulfilled: ActionCreatorWithPayload<TimeHistoryEntry>;
  rejected: ActionCreatorWithPayload<Error>;
}> = {
  pending: createAction('tokens/fetchTokenTimeHistory/pending'),
  fulfilled: createAction('tokens/fetchTokenTimeHistory/fulfilled'),
  rejected: createAction('tokens/fetchTokenTimeHistory/rejected'),
};

export const updateOrderBook = createAction<
  [
    Token,
    {
      buys: TokenTrade[];
      sells: TokenTrade[];
    },
  ]
>('tokens/updateOrderBook');
export const updatePrice = createAction<[Token, number]>('tokens/updatePrice');

export const selectToken = createAction<string>('tokens/select');
export const selectHistory = createAction('tokens/selectHistory');
export const deselectHistory = createAction('tokens/deselectHistory');
export const selectTimeHistory = createAction<TimeHistory>(
  'tokens/selectTimeHistory',
);
