import { createReducer } from '@reduxjs/toolkit';
import { toggleDarkMode } from './actions';

export interface SettingsState {
  readonly darkMode: boolean;
}

const initialState: SettingsState = {
  darkMode: true,
};

export default createReducer(initialState, (builder) =>
  builder.addCase(toggleDarkMode, (state, action) => {
    return {
      ...state,
      darkMode: !state.darkMode,
    };
  }),
);
