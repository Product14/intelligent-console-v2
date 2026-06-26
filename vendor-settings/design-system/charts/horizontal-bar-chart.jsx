'use client';

import React, { useState } from 'react';

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Label,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import HorizontalBarGraphSkeleton from './graph-skeletons/horizontal-bar-graph-skeleton';

const defaultStyles = {
  defaultBarBg: '#B983F6', // main purple
  onHoverBarBg: '#A259EC', // hover purple
  barLabelColor: '#fff',
  barLabelFontWeight: 600,
  barLabelFontSize: 14,
  barBackground: 'rgba(185, 131, 246, 0.12)', // subtle purple background
};

const CustomBarShape = ({
  x,
  y,
  width,
  height,
  fill,
  payload,
  customStyles,
}) => {
  const [hovered, setHovered] = useState(false);
  const styles = { ...defaultStyles, ...customStyles };
  // Custom SVG path for only top-right and bottom-right corners rounded (6px)
  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <path
        d={`M${x},${y} H${x + width - 6} Q${x + width},${y} ${x + width},${y + 6} V${y + height - 6} Q${x + width},${y + height} ${x + width - 6},${y + height} H${x} Z`}
        fill={hovered ? styles.onHoverBarBg : styles.defaultBarBg}
      />
    </g>
  );
};

const CustomBarLabel = (props) => {
  const { x, y, width, height, value, customStyles } = props;
  const styles = { ...defaultStyles, ...customStyles };
  const labelX = x + width / 2;
  const labelY = y + height / 2 + 2; // +2 for vertical centering
  return (
    <text
      x={labelX}
      y={labelY}
      fill={styles.barLabelColor || 'rgba(0, 0, 0, 1)'}
      fontWeight={styles.barLabelFontWeight || 600}
      fontSize={styles.barLabelFontSize || 14}
      textAnchor="middle"
      alignmentBaseline="middle"
      style={{ pointerEvents: 'none' }}
      position="right"
    >
      {value}
    </text>
  );
};
const CustomYAxisTick = (props) => {
  const { x, y, payload, customStyles } = props;
  // Truncate each line to max 10 chars, add ellipsis if longer
  const lines = String(payload.value)
    .split(/\n|\r|\r\n|  | {2,}/g)
    .map((line) => (line.length > 8 ? line.slice(0, 8) + '…' : line));
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={i * 14}
          textAnchor="end"
          fontSize={12}
          fill={customStyles?.barLabelColor || 'rgba(0, 0, 0, 0.4)'}
          fontWeight={customStyles?.barLabelFontWeight || 500}
          alignmentBaseline="middle"
        >
          {line}
        </text>
      ))}
    </g>
  );
};

const HorizontalBarChart = ({
  data,
  yAxisLabel,
  xAxisLabel,
  customStyles,
  isLoading,
  isError,
}) => {
  const styles = { ...defaultStyles, ...customStyles };
  const maxValue = Math?.max(...data.map((d) => d.value));
  const chartData = data?.map((d) => ({ ...d, maxValue }));
  return (
    <div className="w-full">
      {isLoading ? (
        <HorizontalBarGraphSkeleton />
      ) : (
        <ResponsiveContainer width="100%" height="100%" minHeight={350}>
          <ComposedChart
            layout="vertical"
            width="100%"
            height="100%"
            data={chartData}
            margin={{
              top: 5,
              right: 20,
              bottom: 20,
              left: 30,
            }}
          >
            <CartesianGrid
              horizontal={false}
              vertical={false}
              strokeDasharray="10 10"
              stroke="rgba(0, 0, 0, 0.1)"
            />
            <XAxis
              type="number"
              axisLineColor="rgba(0, 0, 0, 0.1)"
              tickLine={false}
              fontSize={12}
              axisLine={false}
              textColor="rgba(0, 0, 0, 0.4)"
            >
              {xAxisLabel && (
                <Label
                  value={xAxisLabel}
                  angle={0}
                  position="bottom"
                  offset={8}
                  style={{
                    fontSize: 12,
                    fill: 'rgba(0, 0, 0, 0.6)',
                    fontWeight: 600,
                    textAnchor: 'end',
                    width: '100%',
                  }}
                />
              )}
            </XAxis>
            <YAxis
              dataKey="name"
              type="category"
              // scale="band"
              axisLineColor="rgba(0, 0, 0, 0.1)"
              tickLine={false}
              fontSize={12}
              tick={<CustomYAxisTick customStyles={styles} />}
              axisLine={false}
              textColor="rgba(0, 0, 0, 0.4)"
            ></YAxis>
            <Bar
              dataKey="value"
              radius={[0, 6, 6, 0]}
              isAnimationActive={true}
              barSize={28}
              minPointSize={10}
              // label={<CustomBarLabel customStyles={styles} />}
              label={{
                position: 'right',
                fontSize: 12,
                fontWeight: 500,
                fill: 'rgba(0, 0, 0, 0.8)',
                offset: 10,
                alignmentBaseline: 'top',
              }}
              shape={<CustomBarShape customStyles={styles} />}
              background={{ fill: '#BC80EA33' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default HorizontalBarChart;
