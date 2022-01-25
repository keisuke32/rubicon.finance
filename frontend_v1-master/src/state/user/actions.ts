import {
  ActionCreatorWithoutPayload,
  ActionCreatorWithPayload,
  createAction,
} from '@reduxjs/toolkit';
import { UserToken } from '../../types';

export const fetchUserTokenList: Readonly<{
  pending: ActionCreatorWithoutPayload;
  fulfilled: ActionCreatorWithPayload<UserToken[]>;
  rejected: ActionCreatorWithPayload<Error>;
}> = {
  pending: createAction('user/fetchTokenList/pending'),
  fulfilled: createAction('userfetchTokenList/fulfilled'),
  rejected: createAction('user/fetchTokenList/rejected'),
};
