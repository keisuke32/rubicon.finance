import React from 'react';
import { Search } from 'react-feather';
import styled from 'styled-components';

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (search: string) => void;
}

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 55px;
`;

const StyledSearchIcon = styled(Search)`
  position: absolute;
  left: 20px;
  color: ${({ theme }) => theme.text.secondary};
  z-index: 2;
`;

const SearchBar = styled.input`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 16px;
  padding-left: 45px;
  height: 100%;
  white-space: nowrap;
  background: none;
  font-weight: 500;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.text.primary};
  border-style: solid;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  -webkit-appearance: none;
  font-size: 12px;
  ::placeholder {
    color: ${({ theme }) => theme.text.secondary};
  }
  transition: all 200ms ease-in;
  :focus {
    background-color: ${({ theme }) => theme.colors.secondary};
    outline: none;
  }
`;

export default function (props: SearchBarProps) {
  return (
    <Wrapper>
      <StyledSearchIcon size={14} />
      <SearchBar
        placeholder={props.placeholder}
        onChange={(e) => props.onSearch(e.target.value)}
      />
    </Wrapper>
  );
}
