'use client';

import React, { useState } from 'react';

import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import LineChartSkeleton from './graph-skeletons/line-chart-skeleton';

const defaultStyles = {
  defaultLineColor: '#4600F2',
  onHoverLineColor: '#3A5AFE',
  lineStrokeWidth: 2,
  dotRadius: 4,
  dotStrokeWidth: 2,
  type: 'monotone',
};

const CustomLegend = ({ lines }) => {
  return (
    <div className="flex items-center justify-center gap-[21px]">
      {lines.map((line) => (
        <div key={line.dataKey} className="flex items-center gap-2">
          <div
            className="h-[10px] w-[10px] rounded-full"
            style={{ backgroundColor: line.color }}
          />
          <span className="text-xs font-semibold text-stone-500">
            {line.name}
          </span>
        </div>
      ))}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg bg-black p-3 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]">
        <div className="text-sm font-medium text-white">
          <div>{label}</div>
          {payload.map((entry, index) => (
            <div key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const LineChartComponent = ({
  data,
  aspectRatio = 16 / 9,
  xDataKey,
  lines,
  customStyles,
  xAxisLabel,
  yAxisLabel,
  isLoading = false,
  showLegend = true,
  nonNumericAxis = false,
}) => {
  const styles = { ...defaultStyles, ...customStyles };

  return (
    <div className="h-full w-full">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <LineChartSkeleton />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ResponsiveContainer width="100%" height="100%" aspect={aspectRatio}>
            <LineChart
              data={data}
              margin={{ top: 20, left: -25, right: 10, bottom: 0 }}
            >
              <CartesianGrid
                horizontal={true}
                vertical={false}
                stroke="#F2F4F7"
              />
              <XAxis
                dataKey={xDataKey}
                axisLineColor="#F2F4F7"
                tickLine={false}
                fontSize={12}
                axisLine={false}
                textColor="#667085"
                padding={nonNumericAxis ? { left: 30, right: 30 } : undefined}
              >
                {xAxisLabel && (
                  <Label
                    value={xAxisLabel}
                    position="bottom"
                    offset={10}
                    style={{
                      fontSize: 12,
                      fill: 'rgba(0, 0, 0, 0.6)',
                      fontWeight: 600,
                    }}
                  />
                )}
              </XAxis>
              <YAxis
                domain={[0, 'auto']}
                axisLine={false}
                tickLine={false}
                textColor="#667085"
                fontSize={12}
              >
                {yAxisLabel && (
                  <Label
                    value={yAxisLabel}
                    angle={-90}
                    position="insideLeft"
                    offset={8}
                    style={{
                      fontSize: 12,
                      fill: 'rgba(0, 0, 0, 0.6)',
                      fontWeight: 600,
                      textAnchor: 'middle',
                    }}
                  />
                )}
              </YAxis>
              <Tooltip content={<CustomTooltip />} />
              {lines.map((lineConfig, index) => (
                <Line
                  key={index}
                  type={styles.type}
                  dataKey={lineConfig.dataKey}
                  name={lineConfig.name}
                  stroke={lineConfig.color || styles.defaultLineColor}
                  strokeWidth={styles.lineStrokeWidth}
                  dot={false}
                  activeDot={{
                    r: 6,
                    stroke: lineConfig.color || styles.onHoverLineColor,
                    strokeWidth: 2,
                    fill: '#FFFFFF',
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          {showLegend && !isLoading && <CustomLegend lines={lines} />}
        </div>
      )}
    </div>
  );
};

export default LineChartComponent;
