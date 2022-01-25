import React, { useContext, useMemo } from 'react';
import { ThemeContext } from 'styled-components';
import Modal from 'react-modal';
import { useIsTransactionPending } from '../../state/transactions/hooks';
import styled from 'styled-components';
import { AlertTriangle, ArrowUpCircle, X } from 'react-feather';
import { darken } from 'polished';
import Loader, { LoaderWrapper } from '../Loader';
import { useActiveWeb3React } from '../../hooks';
import { getEtherscanLink } from '../../utils';

interface TransactionModalProps {
  attempting: boolean;
  hash: string | undefined;
  error: string | undefined;
  onRequestClose: () => void;
}

Modal.setAppElement('#root');

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
      borderRadius: '10px',
    },
    overlay: {
      zIndex: 5,
      backgroundColor: theme.colors.modalBackground,
    },
  };
}

const Button = styled.div`
  background-color: ${({ theme }) => theme.colors.tertiary};
  color: ${({ theme }) => theme.text.againstRed};
  width: calc(100% - 50px);
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 14px;
  padding: 15px 0px;
  margin: 40px 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 100ms ease-in;
  &:hover {
    opacity: 0.8;
  }
`;

const StyledExit = styled(X)`
  position: absolute;
  top: 5px;
  right: 5px;
  cursor: pointer;
  color: ${({ theme }) => darken(0.1, theme.colors.secondary)};
`;

const Wrapper = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  // padding: 20px;
`;

const Title = styled.span`
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  font-size: 18px;
`;

const Subtitle = styled.span`
  font-size: 12px;
  padding-bottom: 20px;
`;

const A = styled.a`
  text-decoration: none;
  color: ${({ theme }) => theme.text.secondary} !important;
`;

const WarningIcon = styled(AlertTriangle)`
  color: ${({ theme }) => theme.text.red};
  margin-bottom: 20px;
`;

const SuccessIcon = styled(ArrowUpCircle)`
  color: ${({ theme }) => theme.text.green};
  margin-bottom: 20px;
`;

const Body = styled.div`
  display: flex;
  padding: 40px 0;
  flex-direction: column;
  align-items: center;
`;

const ErrorMessage = styled.span`
  color: ${({ theme }) => theme.text.red};
  font-size: 16px;
  text-align: center;
`;

const Header = styled.div`
  font-size: 24px;
  text-align: left;
  padding: 20px;
  width: 100%;
`;

const Footer = styled.div`
  background-color: ${({ theme }) => theme.colors.secondary};
  width: 100%;
`;

export default function ({
  hash,
  attempting,
  error,
  onRequestClose,
}: TransactionModalProps) {
  const { chainId } = useActiveWeb3React();
  const modalStyle = useModalStyle();

  const transactionPending = useIsTransactionPending(hash);

  const modalContent = useMemo(() => {
    if (attempting || transactionPending) {
      return (
        <>
          <LoaderWrapper style={{ padding: '50px 100px' }}>
            <Loader size="100px" />
          </LoaderWrapper>
          <Title>
            {attempting
              ? 'Waiting for User Confirmation'
              : 'Waiting for Transaction to Hash'}
          </Title>
          <Subtitle>
            {attempting ? (
              'Confirm this transaction in your wallet'
            ) : (
              <A
                href={getEtherscanLink(chainId!, hash!, 'transaction')}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Etherscan
              </A>
            )}
          </Subtitle>
        </>
      );
    }

    if (error) {
      return (
        <>
          <Header>Error</Header>
          <Body>
            <WarningIcon size="80px" />
            <ErrorMessage>{error}</ErrorMessage>
          </Body>
          <Footer>
            <Button onClick={onRequestClose}>Dismiss</Button>
          </Footer>
        </>
      );
    }

    return (
      <>
        <Header>Success</Header>
        <Body>
          <SuccessIcon size="100px" />
          <Title>Transaction Submitted</Title>
          <Subtitle>
            <A
              href={getEtherscanLink(chainId!, hash!, 'transaction')}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Etherscan
            </A>
          </Subtitle>
        </Body>
        <Footer>
          <Button onClick={onRequestClose}>Dismiss</Button>
        </Footer>
      </>
    );

    // We have reached success! Woohoo!
  }, [attempting, transactionPending, error, hash, chainId, onRequestClose]);
  return (
    <Modal
      isOpen={attempting || !!hash || !!error}
      style={modalStyle}
      onRequestClose={onRequestClose}
    >
      <Wrapper>
        <StyledExit onClick={onRequestClose} size={30} />
        {modalContent}
      </Wrapper>
    </Modal>
  );
}
