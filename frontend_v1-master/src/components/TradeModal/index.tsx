import { darken } from 'polished';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { HelpCircle, X } from 'react-feather';
import Modal from 'react-modal';
import ReactSlider from 'react-slider';
import styled, { css, ThemeContext } from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import { useBestOffers, useMarketContract, useMarketContractAddress } from '../../hooks/contract';
import { useTokenBalances } from '../../hooks/wallet';
import { useSelectedQuote } from '../../state/quotes/hooks';
import { useSelectedToken } from '../../state/tokens/hooks';
import { BigNumber } from '@ethersproject/bignumber';
import {
  executeLimitTrade,
  getTokenAddress,
  executeMatchTrade,
  useDebounce,
  loadTotalPrice,
  isNumeric,
  getSigner,
} from '../../utils';
import Loader, { LoaderWrapper } from '../Loader';
import { TransactionResponse } from '@ethersproject/providers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { ApprovalState, useApproveCallback } from '../../hooks/approval';
import { useTransactionAdder } from '../../state/transactions/hooks';
import TransactionModal from './TransactionModal';
import { LIQUIDITY_PROVIDER_FEE } from '../../config';
import sliderThumb from '../../assets/img/slider-thumb.png';
import Decimal from 'decimal.js';

interface TradeModalProps {
  isOpen: boolean;
  isBuy: boolean;
  onRequestClose: () => void;
}

Modal.setAppElement('#root');

const Header = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  padding: 15px 0;
  background-color: ${({ theme }) => theme.colors.secondary};
  border-bottom: 1px solid
    ${({ theme }) => darken(0.05, theme.colors.secondary)};
`;

const StyledExit = styled(X)`
  position: absolute;
  top: 50%;
  right: 5px;
  transform: translateY(-50%);
  cursor: pointer;
  color: ${({ theme }) => darken(0.1, theme.colors.secondary)};
`;

const InnerContentWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  margin-top: 20px;
`;

const MainButton = styled.div<{ disabled: boolean }>`
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.secondary : theme.colors.tertiary};
  color: ${({ theme, disabled }) =>
    disabled ? theme.text.secondary : theme.text.againstRed};
  width: 100%;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 14px;
  padding: 15px 0;
  margin: 45px 0 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 100ms ease-in;
  &:hover {
    opacity: 0.8;
  }
`;

const WalletBalanceWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 500;
  width: 100%;
  margin-top: 10px;
`;

const WalletBalanceLabel = styled.span`
  color: ${({ theme }) => theme.text.secondary};
`;

const WalletBalance = styled.span`
  color: ${({ theme }) => theme.text.primary};
`;

const SectionTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  width: 100%;
  margin-bottom: 10px;
`;

const Table = styled.table`
  border-collapse: collapse;
  // background-color: transparent;
  width: 100%;
`;

const TrSlider = styled.tr`
  height: inherit;
  line-height: inherit;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.text.secondary};
  }
`;

const TdSlider = styled.td``;

const Slider = styled(ReactSlider)`
  width: 100%;
  height: 25px;
`;

const StyledThumb = styled.div`
  text-align: center;
  border-radius: 4px;
  cursor: grab;
  &:hover {
    opacity: 0.8;
  }
`;

const ThumbImage = styled.img`
  width: 16px;
  height: 20px;
`;

const Thumb = (props: any, state: any) => (
  <StyledThumb {...props}>
    <ThumbImage src={sliderThumb} alt="thumb" />
  </StyledThumb>
);

const StyledTrack = styled.div`
  top: 22px;
  bottom: 0;
  background: #fff;
`;

const Track = (props: any, state: any) => (
  <StyledTrack {...props} index={state.index} />
);

const Tr = styled.tr`
  height: inherit;
  line-height: inherit;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.text.secondary};
  }
`;

const TrNoLine = styled.tr`
  height: inherit;
  line-height: inherit;
`;

const Th = styled.th`
  font-size: 14px;
  padding: 15px 0;
  text-align: left;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.secondary};
  }
`;

const TdInput = styled.td`
  text-align: right;
  font-size: 16px;
`;

const TdLabel = styled.td`
  text-transform: uppercase;
  font-size: 16px;
  text-align: left;
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
`;

const TdButton = styled.td`
  font-weight: 600;
  text-transform: uppercase;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

const TdButtonEnd = styled.td`
  font-weight: 600;
  text-transform: uppercase;
  text-align: right;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

const Input = styled.input`
  caret-color: ${({ theme }) => theme.colors.tertiary};
  border: none;
  background: none;
  outline: none;
  font-size: 16px;
  text-align: right;
  font-weight: 500;
  width: 100%;
  padding-right: 5px;
  color: ${({ theme }) => theme.text.primary};
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const PriceInput = styled(Input)<{ isMarket: boolean; isBuy: boolean }>`
  color: ${({ theme, isMarket, isBuy }) =>
    isMarket
      ? isBuy
        ? theme.text.green
        : theme.text.red
      : theme.text.primary};
`;

const TabGroupWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  position: relative;
  background-color: ${({ theme }) => theme.colors.secondary};
`;

const TabGroupSelector = styled.div<{ selected: boolean }>`
  font-size: 11px;
  text-transform: uppercase;
  overflow: none;
  padding: 8px 0;
  cursor: pointer;
  width: 50%;
  text-align: center;
  font-weight: 600;
  border-bottom: 1px solid
    ${({ theme }) => darken(0.05, theme.colors.secondary)};
  color: ${({ selected, theme }) =>
    selected ? theme.text.tertiary : theme.text.secondary};
`;

const TabGroupLine = styled.div<{ isMarket: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 4px;
  background-color: ${({ theme }) => theme.colors.tertiary};
  border-radius: 3px;
  ${({ isMarket }) =>
    isMarket
      ? css`
          right: 50%;
        `
      : css`
          left: 50%;
        `}
`;

const StyledHelpCircle = styled(HelpCircle)`
  color: ${({ theme }) => theme.text.secondary};
`;

function useWalletBalance(isBuySelected: boolean): [string, Decimal] {
  const token = useSelectedToken()!;
  const quote = useSelectedQuote()!;
  const [balances] = useTokenBalances();

  return isBuySelected
    ? [quote.ticker, balances[quote.ticker] || new Decimal(0)]
    : [token.ticker, balances[token.ticker] || new Decimal(0)];
}

function useModalStyle(): Modal.Styles {
  const theme = useContext(ThemeContext);

  return {
    content: {
      maxHeight: '95%',
      overflowY: 'auto',
      width: '24.5rem',
      top: '50%',
      bottom: 'none',
      left: '50%',
      padding: '0',
      transform: 'translate(-50%, -50%)',
      border: `1px solid ${theme.colors.secondary}`,
      background: theme.colors.primary,
    },
    overlay: {
      zIndex: 5,
      backgroundColor: theme.colors.modalBackground,
    },
  };
}

export default function ({ isBuy, isOpen, onRequestClose }: TradeModalProps) {
  const token = useSelectedToken()!;
  const quote = useSelectedQuote()!;

  const { chainId } = useActiveWeb3React();

  const tokenAddress = getTokenAddress(token, chainId!)!;
  const quoteAddress = getTokenAddress(quote, chainId!)!;

  const addTransaction = useTransactionAdder();
  const [approvalState, approve] = useApproveCallback(
    isBuy ? quoteAddress : tokenAddress,
    useMarketContractAddress()
  );

  const [priceInput, setPriceInput] = useState('');
  const [quantityInput, setQuantityInput] = useState('');
  const [totalInput, setTotalInput] = useState('');
  const [isMarket, setIsMarket] = useState(true);

  const quantityRef = useRef<HTMLInputElement>(null);

  const [walletTicker, walletBalance] = useWalletBalance(isBuy);
  const [offers, loadingOffers] = useBestOffers();

  const marketContract = useMarketContract()!;
  const [marketState, setMarketState] = useState<{
    loading: boolean;
    payAmount: BigNumber;
    error: boolean;
  }>({
    loading: false,
    payAmount: BigNumber.from(0),
    error: false,
  });

  const debouncedMarketState = useDebounce(marketState, 200); // 200 ms debounce time

  useEffect(() => {
    if (debouncedMarketState.payAmount.isZero()) return;
    // Send a web3 call to load the best price
    loadTotalPrice(
      marketContract,
      tokenAddress,
      quoteAddress,
      debouncedMarketState.payAmount,
      isBuy,
    )
      .then((result) => {
        updateValues(formatUnits(result, quote.precision), 3, false);
        setMarketState({
          ...marketState,
          loading: false,
          error: false,
        });
      })
      .catch(() => {
        updateValues('0', 3, false);
        setMarketState({
          ...marketState,
          loading: false,
          error: true,
        });
      });
  }, [debouncedMarketState.payAmount]);

  useEffect(() => {
    quantityRef.current?.focus();
  }, [loadingOffers]);

  const sliderRatio = useMemo(() => {
    if (priceInput === '' || parseFloat(priceInput) == 0) return 1;
    let quantity = new Decimal(walletBalance).div(priceInput).toNumber();
    if (quantity == 0) return 1;
    let ratio = 0;
    while (quantity <= 1e18) {
      ratio++;
      quantity *= 10;
    }
    return Math.pow(10, ratio);
  }, [walletBalance, priceInput]);

  const maxQuantity = useMemo(() => {
    if (priceInput === '' || parseFloat(priceInput) == 0) return 0;
    return (
      new Decimal(walletBalance)
        // .div(1 + LIQUIDITY_PROVIDER_FEE)
        .mul(sliderRatio)
        .div(isBuy ? priceInput : 1)
        .toNumber()
    );
  }, [walletBalance, priceInput]);

  const currentOffer = useMemo(() => {
    if (loadingOffers) return undefined;

    return isBuy ? offers.buy : offers.sell;
  }, [isBuy, offers, loadingOffers]);

  const modalStyle = useModalStyle();

  // Transaction modal values
  const [{ attempting, hash, error }, setTransactionState] = useState<{
    attempting: boolean;
    hash: string | undefined;
    error: string | undefined;
  }>({
    attempting: false,
    hash: undefined,
    error: undefined,
  });

  const currentFee = useMemo(() => {
    if (!priceInput || !quantityInput || !totalInput || !isMarket) {
      return new Decimal(0);
    }

    const toFee = new Decimal(isBuy ? totalInput : quantityInput);
    const feeAsInteger = new Decimal(LIQUIDITY_PROVIDER_FEE);

    return toFee.mul(feeAsInteger);
  }, [priceInput, quantityInput, totalInput, isMarket, isBuy]);

  const buttonEnabled = useMemo(() => {
    if (
      walletBalance.isZero() ||
      approvalState === ApprovalState.UNKNOWN ||
      approvalState === ApprovalState.PENDING
    ) {
      return false;
    }

    if (approvalState === ApprovalState.NOT_APPROVED) {
      return true;
    }

    if (marketState.loading || marketState.error) {
      return false;
    }

    let inputBN = new Decimal(0);
    try {
      inputBN = new Decimal((isBuy ? totalInput : quantityInput) || '0');
    } catch (ex) {}

    if (inputBN.isZero()) {
      return false;
    }
    if (new Decimal(quantityInput).isZero()) {
      return false;
    }
    return walletBalance.gte(inputBN.add(/* currentFee || */ 0));
  }, [
    walletBalance,
    approvalState,
    isBuy,
    totalInput,
    quantityInput,
    currentFee,
    marketState.loading,
    marketState.error,
  ]);
  const buttonText = useMemo(() => {
    if (walletBalance.isZero()) {
      return isBuy ? 'No funds available' : 'No supply available';
    }

    if (approvalState === ApprovalState.NOT_APPROVED) {
      return 'Approve';
    }

    if (approvalState === ApprovalState.PENDING) {
      return (
        <>
          <span style={{ marginRight: '5px' }}>Approving</span>
          <Loader stroke="white" size="15px" />
        </>
      );
    }

    if (marketState.error) {
      return 'Insufficient Liquidity';
    }

    return isBuy ? 'Buy' : 'Sell';
  }, [walletBalance, isBuy, approvalState, marketState.error]);

  useEffect(() => {
    if (isMarket && currentOffer && !priceInput) {
      const price = new Decimal(currentOffer.price);
      setPriceInput(price.toString());
    }
  }, [currentOffer, isMarket, priceInput]);

  const updateIsMarket = () => {
    setPriceInput('');
    setQuantityInput('');
    setTotalInput('');
    setIsMarket(!isMarket);
  };

  const executeClick = useCallback(async () => {
    if (!buttonEnabled) {
      return;
    }

    if (approvalState === ApprovalState.NOT_APPROVED) {
      return approve();
    }

    let trade: Promise<TransactionResponse>;
    if (isMarket) {
      if (
        !totalInput ||
        !quantityInput ||
        marketState.error ||
        marketState.loading
      )
        return;

      const buyGem = isBuy ? tokenAddress : quoteAddress;
      const payGem = isBuy ? quoteAddress : tokenAddress;

      const buyAmount = isBuy
        ? parseUnits(quantityInput, token.precision)
        : parseUnits(totalInput, quote.precision);
      const maxFill = isBuy
        ? parseUnits(totalInput, quote.precision)
        : parseUnits(quantityInput, token.precision);

      trade = executeMatchTrade(
        marketContract,
        buyGem,
        payGem,
        buyAmount,
        maxFill,
        chainId,
      );
    } else {
      const payAmount = isBuy
        ? parseUnits(totalInput, quote.precision)
        : parseUnits(quantityInput, token.precision);
      const buyAmount = isBuy
        ? parseUnits(quantityInput, token.precision)
        : parseUnits(totalInput, quote.precision);
      const payAddress = isBuy ? quoteAddress : tokenAddress;
      const buyAddress = isBuy ? tokenAddress : quoteAddress;

      trade = executeLimitTrade(
        marketContract,
        payAmount,
        payAddress,
        buyAmount,
        buyAddress,
        chainId,
      );
    }

    try {
      setTransactionState({ attempting: true, hash, error });
      const result = await trade;
      addTransaction(result);
      setTransactionState({ attempting: false, hash: result.hash, error });
    } catch (e) {
      const msg =
        e.code === 4001
          ? 'User rejected transaction.'
          : `Trade failed: ${e.message}`;
      setTransactionState({ attempting: false, hash, error: msg });
    }

    // onRequestClose();
  }, [
    approve,
    buttonEnabled,
    marketContract,
    totalInput,
    quantityInput,
    isBuy,
    tokenAddress,
    quoteAddress,
    onRequestClose,
    isMarket,
    approvalState,
    addTransaction,
    marketState.error,
    marketState.loading,
  ]);

  const updateValues = (
    value: string,
    type: number,
    refresh: boolean = true,
  ) => {
    if (!isNumeric(value)) return;

    let valueDecimal = new Decimal(0);
    try {
      valueDecimal = new Decimal(value);
    } catch (ex) {
      // return;
    }

    if (type === 1) {
      setPriceInput(value);
      if (!refresh) return;
      if (quantityInput)
        setTotalInput(valueDecimal.times(quantityInput).toString());
      else if (totalInput)
        setQuantityInput(new Decimal(totalInput).div(valueDecimal).toString());
    } else if (type === 2) {
      setQuantityInput(value);
      if (!refresh) return;
      if (isMarket) {
        setMarketState({
          ...marketState,
          loading: true,
          payAmount: parseUnits(valueDecimal.toString(), token.precision),
        });
      } else {
        if (priceInput)
          setTotalInput(valueDecimal.times(priceInput).toString());
        else if (totalInput)
          setPriceInput(new Decimal(totalInput).div(valueDecimal).toString());
      }
    } else if (type === 3) {
      setTotalInput(value);
      if (!refresh) return;
      if (quantityInput)
        setPriceInput(valueDecimal.div(quantityInput).toString());
      else if (priceInput)
        setQuantityInput(valueDecimal.div(priceInput).toString());
    }
  };

  return (
    <Modal isOpen={isOpen} style={modalStyle} onRequestClose={onRequestClose}>
      <Header>
        {token.name}
        <StyledExit onClick={onRequestClose} size={30} />
      </Header>
      <TabGroupWrapper>
        <TabGroupSelector selected={isMarket} onClick={updateIsMarket}>
          Market
        </TabGroupSelector>
        <TabGroupSelector selected={!isMarket} onClick={updateIsMarket}>
          Limit
        </TabGroupSelector>
        <TabGroupLine isMarket={isMarket} />
      </TabGroupWrapper>
      {approvalState === ApprovalState.UNKNOWN || loadingOffers ? (
        <InnerContentWrapper>
          <LoaderWrapper>
            <Loader size="50px" />
          </LoaderWrapper>
        </InnerContentWrapper>
      ) : (
        <InnerContentWrapper>
          <SectionTitle>{isBuy ? 'Buy' : 'Sell'} Offer</SectionTitle>
          <Table>
            <tbody>
              <Tr>
                <Th>Price</Th>
                <TdInput>
                  <PriceInput
                    type="text"
                    placeholder="0.0"
                    value={priceInput}
                    onChange={(e) => updateValues(e.target.value, 1)}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="decimal"
                    pattern="^[0-9]*[.]?[0-9]*$"
                    maxLength={50}
                    disabled={isMarket}
                    isMarket={isMarket}
                    isBuy={isBuy}
                  />
                </TdInput>
                <TdLabel>{quote.ticker}</TdLabel>
              </Tr>
              <Tr>
                <Th>Quantity</Th>
                <TdInput>
                  <Input
                    type="test"
                    placeholder="0.0"
                    value={quantityInput}
                    onChange={(e) => updateValues(e.target.value, 2)}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="decimal"
                    pattern="^[0-9]*[.]?[0-9]*$"
                    maxLength={50}
                    ref={quantityRef}
                  />
                </TdInput>
                <TdLabel>{token?.ticker}</TdLabel>
              </Tr>
              {/* <TrSlider>
                <TdButton onClick={() => setQuantityInput('0.0')}>Min</TdButton>
                <TdSlider>
                  <Slider
                    min={0}
                    max={Math.floor(maxQuantity)}
                    onChange={(val) => {
                      console.log('val', val);

                      updateValues(
                        new Decimal(val.toString()).div(sliderRatio).toString(),
                        2,
                      );
                    }}
                    value={
                      quantityInput == ''
                        ? 0
                        : new Decimal(quantityInput).mul(sliderRatio).toNumber()
                    }
                    renderThumb={Thumb}
                    renderTrack={Track}
                  />
                </TdSlider>
                <TdButtonEnd
                  onClick={() =>
                    updateValues(
                      new Decimal(maxQuantity).div(sliderRatio).toString(),
                      2,
                    )
                  }
                >
                  Max
                </TdButtonEnd>
              </TrSlider> */}
              <Tr>
                <Th>Total</Th>
                <TdInput>
                  <PriceInput
                    type="test"
                    placeholder="0.0"
                    value={totalInput}
                    onChange={(e) => updateValues(e.target.value, 3)}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="decimal"
                    pattern="^[0-9]*[.]?[0-9]*$"
                    maxLength={50}
                    disabled={isMarket}
                    isMarket={isMarket}
                    isBuy={isBuy}
                  />
                </TdInput>
                <TdLabel>{quote.ticker}</TdLabel>
              </Tr>
            </tbody>
          </Table>
          <MainButton disabled={!buttonEnabled} onClick={executeClick}>
            {buttonText}
          </MainButton>
          <WalletBalanceWrapper>
            <WalletBalanceLabel>Wallet Balance</WalletBalanceLabel>
            <WalletBalance>
              {walletBalance.toFixed(4)} {walletTicker}
            </WalletBalance>
          </WalletBalanceWrapper>
          <WalletBalanceWrapper>
            <WalletBalanceLabel>
              Fee{' '}
              <a
                href="https://docs.rubicon.finance/contracts/rubicon-market/fee-structure"
                target="_blank"
                rel="noopener noreferrer"
              >
                <StyledHelpCircle size="15px" />
              </a>
            </WalletBalanceLabel>
            <WalletBalance>
              {currentFee.toFixed(4)} {walletTicker}
            </WalletBalance>
          </WalletBalanceWrapper>
          <TransactionModal
            onRequestClose={() => {
              onRequestClose();
              setTransactionState({
                attempting: false,
                hash: undefined,
                error: undefined,
              });
            }}
            attempting={attempting}
            hash={hash}
            error={error}
          />
        </InnerContentWrapper>
      )}
    </Modal>
  );
}
