import { MaxUint256 } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import { useCallback, useMemo } from 'react';
import { useActiveWeb3React } from '.';
import { DEFAULT_CHAIN, markets } from '../config';
import {
  useHasPendingApproval,
  useTransactionAdder,
} from '../state/transactions/hooks';
import { useTokenContract } from './contract';
import { useTokenAllowance } from './wallet';

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  token: string,
  spender: string,
): [ApprovalState, () => Promise<void>] {
  const { chainId } = useActiveWeb3React();

  if (spender === undefined) {
    spender = markets[chainId!].address;
  }

  const [currentAllowance, allowanceLoading] = useTokenAllowance(
    token,
    spender,
  );
  const pendingApproval = useHasPendingApproval(token, spender);

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (allowanceLoading) return ApprovalState.UNKNOWN;
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN;

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.isZero()
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED;
  }, [currentAllowance, allowanceLoading, pendingApproval]);

  const tokenContract = useTokenContract(token);
  const addTransaction = useTransactionAdder();

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily');
      return;
    }
    if (!token) {
      console.error('no token');
      return;
    }

    if (!tokenContract) {
      console.error('tokenContract is null');
      return;
    }

    if (!spender) {
      console.error('no spender');
      return;
    }

    if (chainId == 69) {
      return tokenContract
        .approve(spender, MaxUint256, { gasPrice: 0 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: 'Approve ' + token,
            approval: { tokenAddress: token, spender: spender },
          });
        })
        .catch((error: Error) => {
          console.debug('Failed to approve token', error);
          throw error;
        });
    } else {
      return tokenContract
        .approve(spender, MaxUint256)
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: 'Approve ' + token,
            approval: { tokenAddress: token, spender: spender },
          });
        })
        .catch((error: Error) => {
          console.debug('Failed to approve token', error);
          throw error;
        });
    }
  }, [approvalState, token, tokenContract, spender, addTransaction]);

  return [approvalState, approve];
}
