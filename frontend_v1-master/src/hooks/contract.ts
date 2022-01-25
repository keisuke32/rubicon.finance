import { Contract } from '@ethersproject/contracts';
import { useEffect, useState } from 'react';
import { useActiveWeb3React } from '.';
import { markets } from '../config';
import { ERC20_INTERFACE } from '../constants/abis/erc20';
import { MARKET_INTERFACE } from '../constants/abis/rubiconMarket';
import { BATH_TOKEN_INTERFACE } from '../constants/abis/bathToken';
import { useBlockNumber } from '../state/application/hooks';
import { useSelectedQuote } from '../state/quotes/hooks';
import { useSelectedToken } from '../state/tokens/hooks';
import { ContractOffer } from '../types';
import { getBestOffer, getTokenAddress, useContract } from '../utils';

export function useTokenContract(address: string): Contract | null {
  return useContract(address, ERC20_INTERFACE);
}

export function useMarketContractAddress(): string {
  const { chainId } = useActiveWeb3React();
  return markets[chainId!]?.address || '0x0'; // why this '0x0'?
}

export function useMarketContract(): Contract | null {
  const address = useMarketContractAddress();
  return useContract(address, MARKET_INTERFACE);
}

export function usePoolContract(address: string): Contract | null {
  return useContract(address, BATH_TOKEN_INTERFACE);
}

export function useBestOffers(): [
  { buy?: ContractOffer; sell?: ContractOffer },
  boolean,
] {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{
    buy?: ContractOffer;
    sell?: ContractOffer;
  }>({});

  const { chainId } = useActiveWeb3React();

  const selectedToken = useSelectedToken()!;
  const selectedQuote = useSelectedQuote()!;

  const contract = useMarketContract()!;

  const block = useBlockNumber();

  useEffect(() => {
    const fetchData = async () => {
      const sell = await getBestOffer(
        contract,
        getTokenAddress(selectedQuote, chainId!)!,
        getTokenAddress(selectedToken, chainId!)!,
        selectedToken.precision,
        selectedQuote.precision,
      );

      const buy = await getBestOffer(
        contract,
        getTokenAddress(selectedToken, chainId!)!,
        getTokenAddress(selectedQuote, chainId!)!,
        selectedToken.precision,
        selectedQuote.precision,
        false,
      );

      setResult({ buy, sell });
      setLoading(false);
    };

    try {
      fetchData();
    } catch (error) {
      console.log(error);
    }
  }, [contract, selectedToken, block, chainId, selectedQuote]);

  return [result, loading];
}
