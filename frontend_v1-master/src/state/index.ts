import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { save, load } from 'redux-localstorage-simple';
import application from './application/reducer';
import tokens from './tokens/reducer';
import user from './user/reducer';
import quotes from './quotes/reducer';
import settings from './settings/reducer';
import portfolio from './portfolio/reducer';
import transactions from './transactions/reducer';
import trades from './trades/reducer';

const PERSISTENT_KEYS: string[] = ['settings'];

const store = configureStore({
  reducer: {
    application,
    tokens,
    user,
    quotes,
    settings,
    portfolio,
    transactions,
    trades,
  },
  middleware: [
    ...getDefaultMiddleware({ thunk: false }),
    save({ states: PERSISTENT_KEYS }),
  ],
  preloadedState: load({ states: PERSISTENT_KEYS }),
});

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
