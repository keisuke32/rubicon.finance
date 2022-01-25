import { Router } from 'express';
import { Web3Manager } from '../managers';
import { Network } from '../types';
import { WebsocketProvider } from 'web3-core';
const router = Router();

router.get('/', function (req, res, next) {
  res.send('Rubicon Backend v1');
});

router.get('/status', (req, res, next) => {
  const kovan = Web3Manager.getWeb3(Network.KOVAN)
    .currentProvider as WebsocketProvider;
  const mainnet = Web3Manager.getWeb3(Network.MAINNET)
    .currentProvider as WebsocketProvider;

  res.send({
    kovan: kovan.connection,
    mainnet: mainnet.connection,
  });
});

export { router as indexRouter };
export * from './quotes';
export * from './tokens';
