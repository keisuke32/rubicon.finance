import React, { useState } from 'react';
import { AlertCircle } from 'react-feather';
import styled from 'styled-components';
import { Token } from '../../types';
import SearchBar from './SearchBar';
import TokenListItem from './TokenListItem';
import HistoryItem from './HistoryItem';

interface TokenListProps {
  isHistory: boolean;
  data: (Token & { title: string; subtitle: string })[];
  searchBar?: boolean;
  selectable?: boolean;
}

const Wrapper = styled.div`
  width: 50vw;
  height: 100vh;
  min-width: 300px;
  position: relative;
`;

const Warning = styled.div`
  display: flex;
  align-items: center;
  text-transform: uppercase;
  font-size: 12px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const NoSearchBarHeader = styled.div`
  // position: relative;
  // display: flex;
  align-items: center;
  width: 100%;
  height: 55px;
  text-align: center;
  padding: 20px;
  font-weight: bold;
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
`;

export default function (props: TokenListProps) {
  const [search, setSearch] = useState<string | undefined>(undefined);

  const searchBar = props.searchBar ?? true;

  const filteredData = search
    ? props.data.filter((item) => {
        return (
          item.ticker.toLowerCase().includes(search.toLowerCase()) ||
          item.name.toLowerCase().includes(search.toLowerCase())
        );
      })
    : props.data;

  const sortedData = filteredData.sort((a, b) => {
    return b.currentPrice - a.currentPrice;
  });

  return (
    <Wrapper>
      {searchBar ? (
        <SearchBar
          placeholder="Search by token or asset name"
          onSearch={(s) => setSearch(s)}
        ></SearchBar>
      ) : (
        <NoSearchBarHeader>Your Tokens</NoSearchBarHeader>
      )}
      {props.isHistory && <HistoryItem />}
      {sortedData.map((item) => (
        <TokenListItem
          {...item}
          key={item.title}
          selectable={props.selectable}
        />
      ))}
      {sortedData.length === 0 && (
        <Warning>
          <AlertCircle size={12} style={{ marginRight: 5 }} />
          No tokens found
        </Warning>
      )}
    </Wrapper>
  );
}
