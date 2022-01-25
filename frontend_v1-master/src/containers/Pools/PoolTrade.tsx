import React, { useEffect, useMemo, useCallback, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import { TransactionResponse } from '@ethersproject/providers';
import { parseUnits } from 'ethers/lib/utils';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  Input,
  InputAdornment,
} from '@material-ui/core';
import { depositToPool, withdrawFromPool } from '../../utils';
import { BigNumber } from '@ethersproject/bignumber';
import Decimal from 'decimal.js';
import { ApprovalState, useApproveCallback } from '../../hooks/approval';
import { PoolProps } from '../../types';

const TradeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 40px;
`;

const TradeButton = styled.button`
  margin: 15px 0;
  padding: 10px 10px;
  border-radius: 10px;
  color: ${({ theme }) => theme.text.againstRed};
  background-color: ${({ theme }) => theme.colors.tertiary};
  transition: all 0.1s ease-in;
  cursor: pointer;
  font-size: 24px;
  font-weight: 500;
  text-align: center;
  &:hover {
    opacity: 0.7;
  }
`;

const CustodyInfo = styled.label`
  width: 100%;
  text-align: center;
  font-size: 16px;
`;

const InputV = styled(Input)`
  background-color: white;
  padding-left: 10px;

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type='number'] {
    -moz-appearance: textfield;
  }
  input {
    text-align: right;
  }

  span {
    color: ${({ theme }) => theme.text.gray};
    margin: 0 5px 3px 0;
    cursor: pointer;
  }
`;

export enum OperationType {
  DEPOSIT = 'Deposit',
  WITHDRAW = 'Withdraw',
}

export default function (props: {
  pool: PoolProps;
  userBalance: {
    [ticker: string]: Decimal;
  };
  operation: OperationType;
}) {
  const { pool, operation } = props;
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const { chainId } = useActiveWeb3React();

  const [value, valueSet] = useState<string>('');
  const [error, errorSet] = useState<string>('');

  const maxAvailableValue = props.userBalance[pool.token.ticker].toString();

  pool.contract?.functions.underlying().then((data) => {
    setTokenAddress(data[0]); // maybe we should fetch the tokenAddress earlier
  });

  const [approvalState, approve] = useApproveCallback(
    tokenAddress,
    pool.contract?.address!, //'0xfeBcE666f9866dBAd347A3D7c8F1546843f80c66', //pool.contract.address, // remove hardcode
  );

  // copied from tradeModal
  // TODO: DRY
  const buttonEnabled = useMemo(() => {
    if (
      approvalState === ApprovalState.UNKNOWN ||
      approvalState === ApprovalState.PENDING
    ) {
      return false;
    }

    if (approvalState === ApprovalState.NOT_APPROVED) {
      return true;
    }

    if (value === '') return false;

    return true;
  }, [approvalState, value]);

  const executeOperation = useCallback(async () => {
    if (!buttonEnabled || pool.contract === null) {
      return;
    }
    if (approvalState === ApprovalState.NOT_APPROVED) {
      return approve();
    }

    // validate inputs and balances

    let trade: Promise<TransactionResponse>;

    const valueAmount = parseUnits(value, 18); // TODO: substitute by token precision
    if (operation === OperationType.DEPOSIT) {
      trade = depositToPool(pool.contract, valueAmount, chainId);
    } else if (operation === OperationType.WITHDRAW) {
      // TODO: Change to withdraw
      trade = withdrawFromPool(pool.contract, valueAmount, chainId);
    } else {
      console.error('Pool Trade operation not supported');
      return;
    }

    try {
      const result = await trade;
    } catch (e) {
      console.error(e.message);
    }
  }, [approve, approvalState, value]);

  function getButtonText() {
    // Use Memo or something
    if (approvalState === ApprovalState.NOT_APPROVED) {
      return 'Approve';
    } else {
      return operation;
    }
  }

  useEffect(() => {
    if (value && parseFloat(value) > parseFloat(maxAvailableValue)) {
      errorSet('Value higher than limit');
    } else {
      errorSet('');
    }
  }, [value, maxAvailableValue]);

  // // UseCallback to improve performance?
  // const deposit = async () => {
  //   console.log(
  //     `deposit on contract ${value}`,
  //     props.pool?.contract?.functions,
  //   );
  //   console.debug(props.pool);
  //   if (value && pool.contract) {
  //     try {
  //       let deposit = depositToPool(pool.contract, BigNumber.from(value));
  //       const result = await deposit;
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   }
  // };

  return (
    <TradeWrapper>
      <FormControl error={!!error}>
        <InputLabel htmlFor={`${operation}Value`}>Amount</InputLabel>
        <InputV
          error={!!error}
          id={`${operation}Value`}
          type="number"
          placeholder="0.00"
          value={value}
          onChange={(event) => valueSet(event.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <span onClick={() => valueSet(maxAvailableValue)}>max</span>
            </InputAdornment>
          }
        />
        <FormHelperText>{error}</FormHelperText>
      </FormControl>
      <TradeButton disabled={!buttonEnabled} onClick={executeOperation}>
        {getButtonText()}
      </TradeButton>
      <CustodyInfo>
        {operation === OperationType.DEPOSIT ? 'Wallet' : 'Pool'} Balance:
      </CustodyInfo>
      <CustodyInfo>
        {maxAvailableValue} {operation === OperationType.WITHDRAW && 'bath'}
        {pool.token.ticker}
      </CustodyInfo>
    </TradeWrapper>
  );
}
