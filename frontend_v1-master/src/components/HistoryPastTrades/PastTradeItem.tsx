import React, { useCallback } from 'react';
import { ExternalLink, X } from 'react-feather';
import styled from 'styled-components';
import { UserTrade } from '../../types';
import moment from 'moment';
import { useActiveWeb3React } from '../../hooks';
import { cancelTrade, getEtherscanLink } from '../../utils';
import { useMarketContract } from '../../hooks/contract';

interface PastTradeItemProps {
  trade: UserTrade;
  key: any;
}

const Wrapper = styled.div<{ killed: boolean }>`
  width: 100%;
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
  padding: 10px 0 10px 0;
  margin: 10px 0 10px 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  opacity: ${({ killed }) => (killed ? '20%' : '100%')};
`;

const TextItem = styled.div`
  width: 20%;
  text-align: center;
  color: ${({ theme }) => theme.text.primary};
`;

const Link = styled(ExternalLink)`
  color: ${({ theme }) => theme.text.primary};
`;

const SizeText = styled(TextItem)<{ isBuy: boolean }>`
  color: ${({ isBuy, theme }) => (isBuy ? theme.text.green : theme.text.red)};
`;

const StyledX = styled(X)`
  position: absolute;
  top: 50%;
  left: -1.5px;
  cursor: pointer;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.tertiary};
`;

export default function ({ data }: any) {
  const { chainId } = useActiveWeb3React();

  const contract = useMarketContract()!;

  const cancelTradeCallback = useCallback(async () => {
    return await cancelTrade(contract, data.id, chainId);
  }, [data.id, contract]);

  return (
    <Wrapper killed={data.killed}>
      {!data.completed && !data.killed && (
        <StyledX onClick={cancelTradeCallback} />
      )}
      <TextItem style={{ fontWeight: 500 }}>
        {data.isBuy ? data.buyGem : data.payGem}
      </TextItem>
      <TextItem>{data.isBuy ? 'BUY' : 'SELL'}</TextItem>
      <SizeText isBuy={data.isBuy}>
        {data.isBuy
          ? `+${data.buyAmount.toFixed(4)}`
          : `-${data.payAmount.toFixed(4)}`}
      </SizeText>
      <SizeText isBuy={data.isBuy}>
        {data.isBuy
          ? `$${(data.payAmount / data.buyAmount).toFixed(2)}`
          : `$${(data.buyAmount / data.payAmount).toFixed(2)}`}
      </SizeText>
      <TextItem>{moment.unix(data.timestamp).fromNow()}</TextItem>
      <TextItem>
        <a
          href={getEtherscanLink(chainId!, data.transactionHash, 'transaction')}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Link />
        </a>
      </TextItem>
    </Wrapper>
  );
}
