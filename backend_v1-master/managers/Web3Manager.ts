import { readFileSync } from 'fs';
import Web3 from 'web3';
import { markets, providers } from '../config';
import { Network, PartialRecord } from '../types';
import { Contract } from 'web3-eth-contract';
import { instance as PriceManager } from './PriceManager';

class Web3Manager {
  private instances: Record<Network, Web3>;
  private contracts: PartialRecord<Network, Contract>;

  constructor() {
    this.instances = {
      [Network.MAINNET]: this.createWeb3Provider(providers[Network.MAINNET]),
      [Network.KOVAN]: this.createWeb3Provider(providers[Network.KOVAN]),
      [Network.OPTIMISM_KOVAN]: this.createWeb3Provider(
        providers[Network.OPTIMISM_KOVAN],
      ),
    };
    this.contracts = {
      [Network.KOVAN]: new this.instances[Network.KOVAN].eth.Contract(
        JSON.parse(readFileSync('./abi/RubiconMarket-Kovan.json', 'utf8')).abi,
        markets[Network.KOVAN]!.address,
      ),
      [Network.OPTIMISM_KOVAN]: new this.instances[
        Network.OPTIMISM_KOVAN
      ].eth.Contract(
        JSON.parse(
          readFileSync('./abi/RubiconMarket-Optimism-Kovan.json', 'utf8'),
        ).abi,
        markets[Network.OPTIMISM_KOVAN]!.address,
      ),
      [Network.MAINNET]: new this.instances[Network.MAINNET].eth.Contract(
        JSON.parse(
          readFileSync('./abi/RubiconMarket-Mainnet.json', 'utf8'),
        ).abi,
        markets[Network.MAINNET]!.address,
      ),
    };
  }

  private createWeb3Provider(host: string) {
    const socketProvider = new Web3.providers.WebsocketProvider(host, {
      reconnectDelay: 1,
      reconnect: {
        auto: true,
        delay: 1,
        onTimeout: true,
      },
    });

    socketProvider.on('error', () => {
      console.error('WS Infura Error');
    });

    socketProvider.on('end', () => {
      console.log('WS closed');
      console.log('Attempting to reconnect...');
      const interval = setInterval(() => {
        socketProvider.reconnect();
        if (socketProvider.connected) {
          PriceManager.startFilters();
          clearInterval(interval);
        }
      }, 100);
    });

    return new Web3(socketProvider);
  }

  getWeb3(network: Network) {
    return this.instances[network];
  }

  getContract(network: Network) {
    return this.contracts[network];
  }
}

export const instance = new Web3Manager();
