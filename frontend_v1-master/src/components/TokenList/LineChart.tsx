import React, { useContext } from 'react';
import styled, { DefaultTheme, ThemeContext } from 'styled-components';

interface LineChartProps {
  /**
   * Ordered list of points to graph
   */
  data: number[];
}

const CHART_WIDTH = 50;
const CHART_HEIGHT = 20;

const Wrapper = styled.div`
  height: ${CHART_HEIGHT}px;
  width: ${CHART_WIDTH}px;
`;

const getBaseline = (above: boolean, theme: DefaultTheme) => {
  const NUM_POINTS = 10;

  const points = [...new Array(NUM_POINTS)].map((_, idx) => [
    (idx / NUM_POINTS) * CHART_WIDTH,
    above ? 0 : CHART_HEIGHT,
  ]);
  return points.map(([x, y]) => (
    <circle key={x} cx={x} cy={y} r=".1" stroke={theme.text.secondary} />
  ));
};

export default function ({ data }: LineChartProps) {
  const maxY = Math.max(...data);
  const minY = Math.min(...data);
  const maxX = data.length;

  const upwardsTrend = data[0] < data[data.length - 1];

  const points = data
    .map((rawY, rawX) => {
      const x = (rawX / maxX) * CHART_WIDTH;
      const y =
        CHART_HEIGHT - ((rawY - minY) / (maxY - minY + 1)) * CHART_HEIGHT;
      return `${x},${y}`;
    })
    .join(' ');

  const theme = useContext(ThemeContext);

  return (
    <Wrapper>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        <polyline
          fill="none"
          stroke={upwardsTrend ? theme.text.green : theme.text.red}
          strokeWidth={0.5}
          points={points}
        />
        {getBaseline(!upwardsTrend, theme)}
      </svg>
    </Wrapper>
  );
}
