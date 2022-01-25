import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { injected } from '../connectors';

import { Web3Provider } from '@ethersproject/providers';

declare global {
  interface Window {
    ethereum: any;
  }
}

export function useActiveWeb3React() {
  return useWeb3React<Web3Provider>();
}

export function useEagerConnect() {
  const { activate, active } = useWeb3React(); // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false);

  /* TODO: Investigate the possibility to eager connect using walletlink and walletconnect
  using localStorage as source of last connected wallet info.
  -> On new wallet connection: Store which connector was used, and on the next page reload
  use the data to try to activate the connector (both walletlink and walletconnect already
  store data on localStorage)
  */

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        // **Need logic below to handle different connectors I think
        activate(injected, undefined, true).catch(() => {
          setTried(true);
        });
      } else {
        setTried(true);
      }
    });
  }, [activate]); // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true);
    }
  }, [active]);

  return tried;
}

export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3React();

  useEffect(() => {
    const { ethereum } = window;
    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = (chainId: any) => {
        activate(injected);
      };

      const handleAccountsChanged = (accounts: any) => {
        if (accounts.length > 0) {
          activate(injected);
        }
      };

      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged);
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }

    return () => {};
  }, [active, error, suppress, activate]);
}
