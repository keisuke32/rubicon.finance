import { useSelector } from 'react-redux';
import { AppState } from '..';

export function useDarkMode(): boolean {
  return useSelector((state: AppState) => state.settings.darkMode);
}
