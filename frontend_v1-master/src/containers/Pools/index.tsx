import React, { useEffect, useState } from 'react';
import { BigNumber, utils } from 'ethers';
import styled from 'styled-components';
import { BaseToken, PoolProps } from '../../types';
import {
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  TableContainer,
  Container,
} from '@material-ui/core';
import { getTokenAddress } from '../../utils';
import Loader, { LoaderWrapper } from '../../components/Loader';
import PoolsModal from './PoolsModal';
import { usePoolContract } from '../../hooks/contract';
import { useBlockNumber } from '../../state/application/hooks';
import { TransactionResponse } from '@ethersproject/providers';
import { useActiveWeb3React } from '../../hooks';
import { useTokenBalances, usePoolBalances } from '../../hooks/wallet';
import TokenIcon from '../../components/TokenIcon';
import { bathPools } from '../../config';

// Fix this. remove usage of important, do it properly following material-ui guidelines
const MyTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.text.primary};
  font-size: 20px;
  font-family: 'Montserrat', sans-serif;
`;

const MyTableContainer = styled(TableContainer)`
  margin: 30px 0 0 0;
`;

const AssetWrapper = styled.div`
  display: flex;
  flex-direction: column;
  span {
    margin-top: -5px;
    font-size: 14px;
    font-weight: 100;
    color: ${({ theme }) => theme.text.secondary};
  }
`;

const ItemWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-right: auto;

  img {
    padding-right: 8px;
  }
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 4px;
`;

const Title = styled.span`
  font-size: 16px;
  font-weight: 600;
`;

const Subtitle = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.text.secondary};
`;

export default function () {
  const [pools, setPools] = useState<PoolProps[]>(
    bathPools.map(
      (pool): PoolProps => ({
        token: pool,
        contract: usePoolContract(pool.addresses[0].value),
        poolBalance: BigNumber.from(0),
        growth: 0,
      }),
    ),
  );

  // Check how balances are updated
  const [userBalances] = useTokenBalances();
  const [userPoolBalances, loadingPoolBalances] = usePoolBalances();
  if (Object.keys(userPoolBalances).length > 0) {
    console.log(
      'UserPoolBalances',
      loadingPoolBalances,
      userPoolBalances,
      userPoolBalances['USDC'].toNumber(),
    );
  }
  const { account, chainId } = useActiveWeb3React();
  const [loading, setLoading] = React.useState(false);
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [selectedPool, setPool] = React.useState<PoolProps | null>(null);
  const block = useBlockNumber();

  // ON updates...
  useEffect(() => {
    console.log(`New Block #${block}. Fetching pools data`);
    (async () => {
      pools.map(async (pool) => {
        await pool.contract?.functions
          .totalSupply()
          .then((balance: BigNumber) => {
            const newPools = pools;
            const index = pools.findIndex(
              (x) => x.token.ticker == pool.token.ticker,
            );
            // TODO: throw error if not oldPool
            if (index > -1) {
              pool.poolBalance = balance;
              newPools[index] = pool;
              setPools([...newPools]);
            }
          });
        // TODO: We still need to get contract.functions.balanceOf(account)
      });
    })();
  }, [block, account, chainId]);

  // Select every pool contract data
  async function fetchPoolsValues(pools: any) {
    await Promise.all(
      pools.map(async (pool: any) => {
        const tokenAddress = getTokenAddress(pool.token, chainId!)!;
        const tokenBathContract = usePoolContract(tokenAddress);
        console.log(tokenBathContract, tokenBathContract?.functions);
        // const balance = await fetchPoolValue(pool);
        const balance = await tokenBathContract?.functions.totalSupply();
        return { ...pool, poolBalance: balance.toString() };
      }),
    ).then((updatedPools: any[]) => {
      setPools(updatedPools);
    });
  }

  function selectPool(selectedPool: PoolProps): void {
    setIsOpen(true);
    setPool(selectedPool);
  }

  function userBalanceForToken(token: BaseToken): number {
    const userTokenBalance = userBalances[token.ticker];
    return userTokenBalance?.toNumber();
  }

  function userBalanceForBathToken(token: BaseToken): number {
    const bathToken = userPoolBalances[token.ticker];
    return bathToken?.toNumber();
  }

  return (
    <Container>
      {!!selectedPool ? (
        <PoolsModal
          isOpen={modalIsOpen}
          setIsOpen={setIsOpen}
          pool={selectedPool}
          userBalances={userBalances}
          userPoolBalances={userPoolBalances}
        />
      ) : (
        <></>
      )}
      <MyTableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <MyTableCell>Asset</MyTableCell>
              <MyTableCell classes={{}} align="center">
                Growth
              </MyTableCell>
              <MyTableCell align="center">Wallet Balance</MyTableCell>
              <MyTableCell align="center">Your Pool Balance</MyTableCell>
              <MyTableCell align="center">Total Pool Assets</MyTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pools.map((pool) => (
              <TableRow
                key={pool.token.ticker}
                onClick={() => selectPool(pool)}
              >
                <MyTableCell>
                  <ItemWrapper>
                    <TokenIcon token={pool.token} />
                    <TextWrapper>
                      <Title>{pool.token.ticker}</Title>
                      <Subtitle>{pool.token.name}</Subtitle>
                    </TextWrapper>
                  </ItemWrapper>
                </MyTableCell>
                <MyTableCell align="center">{pool.growth}</MyTableCell>
                <MyTableCell align="center">
                  {userBalanceForToken(pool.token)}
                </MyTableCell>
                <MyTableCell align="center">
                  {userBalanceForBathToken(pool.token)}
                </MyTableCell>
                <MyTableCell align="center">
                  {utils.formatUnits(pool.poolBalance.toString())}
                </MyTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </MyTableContainer>

      {loading && (
        <LoaderWrapper style={{ paddingTop: '30px' }}>
          <Loader size="50px" />
        </LoaderWrapper>
      )}
    </Container>
  );
}
