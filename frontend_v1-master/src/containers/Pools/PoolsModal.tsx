import React, { useEffect, useState, useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import Modal from 'react-modal';
import bathWETH from '../../assets/img/bathWETH.png';
import { utils } from 'ethers';
import Decimal from 'decimal.js';
import PoolTrade, { OperationType } from './PoolTrade';
import { BATH_TOKEN_INTERFACE } from '../../constants/abis/bathToken';

import { PoolProps } from '../../types';

Modal.setAppElement('#root');

const Title = styled.h2`
  width: auto;
`;
const SubTitle = styled.h3`
  margin-top: 0px;
`;
const Operations = styled.div`
  display: flex;
  justify-content: space-between;
`;

const AssetPoolImg = styled.img`
  width: 150px;
  margin-bottom: 50px;
`;

export default function (props: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  pool: PoolProps;
  userBalances: {
    [ticker: string]: Decimal;
  };
  userPoolBalances: {
    [ticker: string]: Decimal;
  };
}) {
  const theme = useContext(ThemeContext);
  const modalStyle: Modal.Styles = {
    content: {
      maxHeight: '95%',
      overflowY: 'auto',
      width: '36rem',
      top: '50%',
      bottom: 'none',
      left: '50%',
      padding: '20px',
      transform: 'translate(-50%, -50%)',
      border: `1px solid ${theme.colors.secondary}`,
      background: theme.colors.primary,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlay: {
      zIndex: 2,
      backgroundColor: theme.colors.modalBackground,
    },
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onRequestClose={() => props.setIsOpen(false)}
      style={modalStyle}
    >
      <Title>{props.pool.token.name} Pool</Title>
      <SubTitle>
        {utils.formatUnits(props.pool.poolBalance.toString())} growing at{' '}
        {props.pool.growth}% APY
        {/* {props.pool.totalPoolBalance} growing at {props.pool.growth} APY */}
      </SubTitle>

      {/* Img must be dynamic (probably a match between props.pool.assetTicket and a map with imgs) */}
      <AssetPoolImg src={bathWETH} />
      <Operations>
        <PoolTrade
          key={`props.pool.token.ticker-deposit`}
          pool={props.pool}
          userBalance={props.userBalances}
          operation={OperationType.DEPOSIT}
        />
        <PoolTrade
          key={`props.pool.token.ticker-withdraw`}
          pool={props.pool}
          userBalance={props.userPoolBalances}
          operation={OperationType.WITHDRAW}
        />
      </Operations>
    </Modal>
  );
}
