import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled, { DefaultTheme, ThemeContext } from 'styled-components';
import moment from 'moment';
import { getSortedPrices, useDebounce } from '../../utils';
import Loader, { LoaderWrapper } from '../Loader';

interface LineChartProps {
  data?: { [timestamp: number]: number };
  loading: boolean;
  onHover: (timestamp?: number) => void;
}

const Wrapper = styled.div`
  width: calc(100% - 40px);
  min-height: 40%;
  margin: 0 20px;
  margin-top: 40px;
  margin-bottom: 3px;
`;

const StyledSVG = styled.svg`
  overflow: visible;
  height: 100%;
  width: 100%;
`;

const OpaqueCircle = styled.circle`
  opacity: 0.2;
`;

const createLine = (yValue: number, theme: DefaultTheme, rect?: DOMRect) => {
  const NUM_POINTS = 60;
  if (!rect) return null;

  const points = [...new Array(NUM_POINTS)].map((_, idx) => [
    (idx / (NUM_POINTS - 1)) * (rect.width || 0),
    yValue,
  ]);
  return points.map(([x, y]) => (
    <OpaqueCircle key={x} cx={x} cy={y} r=".5" stroke={theme.text.secondary} />
  ));
};

const StyledTextLabel = styled.text`
  font-size: 10px;
  color: ${({ theme }) => theme.text.secondary};
  color: red;
  text-transform: uppercase;
  margin-bottom: 5px;
  padding-bottom: 5px;
`;

export default function ({ data, onHover, loading }: LineChartProps) {
  const [rect, setRect] = useState<DOMRect | undefined>(undefined);
  const [[mouseX, mouseY], setMouseCoordinates] = useState([0, 0]);
  const [windowState, setWindowSize] = useState([0, 0]);
  const [hovering, setHovering] = useState(true);

  const [windowHeight, windowWidth] = useDebounce(windowState, 100);

  useEffect(() => {
    const handler = () => {
      setWindowSize([window.innerHeight, window.innerWidth]);
      setRect(svgContainer.current?.getBoundingClientRect());
    };

    window.addEventListener('resize', handler);

    return () => window.removeEventListener('resize', handler);
  }, [windowHeight, windowWidth]);

  const svgContainer = useRef<SVGSVGElement>(null);

  const loadDimensions = useCallback((node) => {
    if (node !== null) {
      setRect(node.getBoundingClientRect());
    }
  }, []);

  const [points, yAverage] = useMemo(() => {
    if (!data || !rect) return [[], 0];
    const height = rect.height;
    const width = rect.width;
    const prices = getSortedPrices(data);

    const maxY = Math.max(...prices);
    const minY = Math.min(...prices);
    const maxX = prices.length - 1;

    const average =
      prices.reduce((prev, curr) => (curr += prev), 0) / prices.length;
    const yAverage = height - ((average - minY) / (maxY - minY + 1)) * height;

    return [
      Object.keys(data)
        .sort()
        .map((n) => Number(n))
        .map((timestamp, rawX) => {
          const rawY = data[timestamp];
          const x = (rawX / maxX) * width;
          const y = height - ((rawY - minY) / (maxY - minY + 1)) * height;
          return [timestamp, x, y];
        }),
      yAverage,
    ];
  }, [data, rect]);

  const theme = useContext(ThemeContext);

  const [hoveredTimestamp, setHoveredTimestamp] = useState<number | undefined>(
    undefined,
  );

  const rawValues = getSortedPrices(data || {});
  const upwardsTrend =
    rawValues.length > 1
      ? rawValues[0] < rawValues[rawValues.length - 1]
      : false;

  const hoverTooltip = useMemo(() => {
    if (!rect || points.length === 0 || !hovering) return null;
    const x = mouseX - rect.left;
    const y = mouseY - rect.top;

    if (x < 0 || y < 0 || x > points[points.length - 1][1]) return null;

    const minValues = points.map((p) => Math.abs(x - p[1]));
    const minIndex = minValues.indexOf(Math.min(...minValues));

    if (!points[minIndex]) return null;

    setHoveredTimestamp(points[minIndex][0]);
    const xGraph = points[minIndex][1];

    const linePoints = `${xGraph},0 ${xGraph},${rect.height}`;
    const Line = (
      <polyline
        fill="none"
        stroke={theme.text.secondary}
        strokeWidth={1.5}
        points={linePoints}
        key="line"
        style={{ opacity: 0.5 }}
      />
    );

    const InnerCircle = (
      <circle
        key="inner"
        cx={xGraph}
        cy={points[minIndex][2]}
        r="3"
        fill={upwardsTrend ? theme.text.green : theme.text.red}
      />
    );

    const OuterCircle = (
      <circle
        key="outer"
        cx={xGraph}
        cy={points[minIndex][2]}
        r="4"
        fill={theme.text.secondary}
      />
    );

    let textXValue = xGraph;
    if (minIndex > points.length - 4) {
      textXValue -= 100;
    } else if (minIndex > 3) {
      textXValue -= 50;
    }

    const TextLabel = (
      <StyledTextLabel
        x={textXValue}
        y={-5}
        key="label"
        fill={theme.text.secondary}
      >
        {moment(points[minIndex][0]).format('h:mm A MMM D [CDT]')}
      </StyledTextLabel>
    );

    return [Line, OuterCircle, InnerCircle, TextLabel];
  }, [mouseX, mouseY, points, hovering, rect, theme, upwardsTrend]);

  useEffect(() => {
    onHover(hovering ? hoveredTimestamp : undefined);
  }, [hoveredTimestamp, hovering, onHover]);

  if (loading) {
    return (
      <Wrapper>
        <LoaderWrapper>
          <Loader size={'50px'} />
        </LoaderWrapper>
      </Wrapper>
    );
  }

  return (
    <Wrapper ref={loadDimensions}>
      <StyledSVG
        viewBox={rect ? `0 0 ${rect.width} ${rect.height}` : '0 0 0 0'}
        preserveAspectRatio="none"
        onMouseMove={(e) => setMouseCoordinates([e.pageX, e.pageY])}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        ref={svgContainer}
      >
        <polyline
          fill="none"
          stroke={upwardsTrend ? theme.text.green : theme.text.red}
          strokeWidth={2}
          points={points.map(([_, x, y]) => `${x},${y}`).join(' ')}
        />
        {createLine(yAverage, theme, rect)}
        {hoverTooltip}
      </StyledSVG>
    </Wrapper>
  );
}
