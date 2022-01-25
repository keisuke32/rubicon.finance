import React from 'react';
import ReactDOM from 'react-dom';
import 'typeface-montserrat';
import * as serviceWorker from './serviceWorker';
import { Web3ReactProvider } from '@web3-react/core';
import { getLibrary } from './utils';
import store from './state';
import { Provider } from 'react-redux';
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme';
import App from './containers/App';
import ApplicationUpdater from './state/application/updater';
import TokensUpdater from './state/tokens/updater';
import UserUpdater from './state/user/updater';
import QuotesUpdater from './state/quotes/updater';
import TransactionsUpdater from './state/transactions/updater';
import TradesUpdater from './state/trades/updater';
import SocketProvider from './components/SocketProvider';
import { StylesProvider } from '@material-ui/styles';

const Updaters = () => {
  return (
    <>
      <ApplicationUpdater />
      <QuotesUpdater />
      <TokensUpdater />
      <UserUpdater />
      <TransactionsUpdater />
      <TradesUpdater />
    </>
  );
};

if (!!(window as any)['ethereum']) {
  (window as any)['ethereum'].autoRefreshOnNetworkChange = true;
}

ReactDOM.render(
  <React.StrictMode>
    <StylesProvider injectFirst>
      <FixedGlobalStyle />
      <Provider store={store}>
        <SocketProvider>
          <Web3ReactProvider getLibrary={getLibrary}>
            <Updaters />
            <ThemeProvider>
              <ThemedGlobalStyle />
              <App />
            </ThemeProvider>
          </Web3ReactProvider>
        </SocketProvider>
      </Provider>
    </StylesProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
