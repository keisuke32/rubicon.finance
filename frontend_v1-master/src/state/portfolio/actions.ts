import {
  ActionCreatorWithoutPayload,
  ActionCreatorWithPayload,
  createAction,
} from '@reduxjs/toolkit';
import { TimeHistory, TimeHistoryEntry } from '../../types';

export const fetchPortfolio: Readonly<{
  pending: ActionCreatorWithoutPayload;
  fulfilled: ActionCreatorWithPayload<[TimeHistory, TimeHistoryEntry]>;
  rejected: ActionCreatorWithPayload<Error>;
}> = {
  pending: createAction('portfolio/fetch/pending'),
  fulfilled: createAction('portfolio/fetch/fulfilled'),
  rejected: createAction('portfolio/fetch/rejected'),
};
