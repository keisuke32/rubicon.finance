import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useSelectedToken } from '../../state/tokens/hooks';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
  padding: 0;
  font-size: 20px;
  margin-bottom: 15px;
`;

const MAX_HEIGHT = 60;
const Body = styled.p<{ useClipped: boolean }>`
  margin: 0;
  padding: 0;
  font-size: 12px;
  letter-spacing: 0.04rem;
  max-height: ${({ useClipped }) => (useClipped ? MAX_HEIGHT + 'px' : 'none')};
  overflow-y: ${({ useClipped }) => (!useClipped ? 'scroll' : 'hidden')};

  ::-webkit-scrollbar {
    width: 0px;
  }

  color: ${({ theme }) => theme.text.secondary};
`;

const Button = styled.span`
  cursor: pointer;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.tertiary};
  font-weight: 500;
  margin-top: 15px;
  font-size: 13px;
`;

const DEFAULT =
  'No description for this token found. View on Etherscan to find out more.';

export default function () {
  const token = useSelectedToken();

  const [useClipped, setUseClipped] = useState(true);

  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bodyRef.current) return;
    setUseClipped(bodyRef.current.getBoundingClientRect().height >= MAX_HEIGHT);
  }, [bodyRef, setUseClipped]);
  return (
    <Wrapper>
      <Title>About</Title>
      <Body ref={bodyRef} useClipped={useClipped}>
        {token?.description || DEFAULT}
      </Body>
      {useClipped && (
        <Button onClick={() => setUseClipped(false)}>Show More</Button>
      )}
    </Wrapper>
  );
}
