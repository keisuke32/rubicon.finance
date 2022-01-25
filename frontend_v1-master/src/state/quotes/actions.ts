import {
  ActionCreatorWithoutPayload,
  ActionCreatorWithPayload,
  createAction,
} from '@reduxjs/toolkit';
import { QuoteToken } from '../../types';

export const fetchQuoteList: Readonly<{
  pending: ActionCreatorWithoutPayload;
  fulfilled: ActionCreatorWithPayload<QuoteToken[]>;
  rejected: ActionCreatorWithPayload<Error>;
}> = {
  pending: createAction('quotes/fetchTokenList/pending'),
  fulfilled: createAction('quotes/fetchTokenList/fulfilled'),
  rejected: createAction('quotes/fetchTokenList/rejected'),
};

export const selectQuoteToken = createAction<string>('quotes/select');
