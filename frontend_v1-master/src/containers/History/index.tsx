import React from 'react';
import TokenList from '../../components/TokenList';
import HistoryPastTrades from '../../components/HistoryPastTrades';
import { useTokens } from '../../state/tokens/hooks';

export default function () {
  const tokens = useTokens();

  const data = tokens.map((t) => ({
    ...t,
    title: t.ticker,
    subtitle: t.name,
  }));

  return (
    <>
      <TokenList
        data={data}
        searchBar={false}
        selectable={true}
        isHistory={true}
      />
      <HistoryPastTrades />
    </>
  );
}
