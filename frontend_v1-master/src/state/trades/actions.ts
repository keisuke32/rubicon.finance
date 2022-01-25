import {
  ActionCreatorWithoutPayload,
  ActionCreatorWithPayload,
  createAction,
} from '@reduxjs/toolkit';
import { UserTrades } from '../../types';

export const fetchUserTrades: Readonly<{
  pending: ActionCreatorWithoutPayload;
  fulfilled: ActionCreatorWithPayload<UserTrades>;
  rejected: ActionCreatorWithPayload<Error>;
}> = {
  pending: createAction('trades/fetchTrades/pending'),
  fulfilled: createAction('trades/fetchTrades/fulfilled'),
  rejected: createAction('trades/fetchTrades/rejected'),
};
