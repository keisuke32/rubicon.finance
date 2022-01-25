import React from 'react';
import styled from 'styled-components';
import unknown from '../../assets/img/unknown-icon.svg';

interface TokenIconProps {
  token: {
    logo?: string;
  };
  size?: string;
}

const DEFAULT_SIZE = '45px';

const Container = styled.div<{ size: string }>`
  border-radius: 50%;
  height: ${({ size }) => size};
  width: ${({ size }) => size};
  display: flex;
`;

const Image = styled.img`
  height: 100%;
  width: 100%;
  object-fit: contain;
`;

export default function ({ token, size }: TokenIconProps) {
  return (
    <Container size={size || DEFAULT_SIZE}>
      <Image src={token.logo || unknown} alt="Icon" />
    </Container>
  );
}
