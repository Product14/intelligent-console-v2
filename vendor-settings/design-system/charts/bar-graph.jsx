'use client';

import React, { useState } from 'react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import BarGraphSkeleton from './graph-skeletons/bar-graph-skeleton';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const vehicles = payload[0].payload.topVehicles || [];
    if (!vehicles?.length) return null;

    const hasValidVehicles = vehicles.some(
      (v) => v?.year && v?.make && v?.model
    );
    if (!hasValidVehicles)
      return (
        <div className="rounded-lg bg-black p-3 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]">
          <ul className="flex flex-col gap-2">
            <li
              key={'no-valid-vehicles'}
              className="text-sm font-medium text-white"
            >
              <span className="text-lg text-white/40">•</span> No details
              available
            </li>
          </ul>
        </div>
      );

    return (
      <div className="rounded-lg bg-black p-3 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]">
        <ul className="flex flex-col gap-2">
          {vehicles?.slice(0, 5).map((v, i) => {
            const vehicleInfo = [v?.year, v?.make, v?.model]
              .filter(Boolean)
              .join(' ');

            return vehicleInfo ? (
              <li key={i} className="text-sm font-medium text-white">
                <span className="text-lg text-white/40">•</span> {vehicleInfo}
              </li>
            ) : null;
          })}
        </ul>
      </div>
    );
  }
  return null;
};

const CustomLabel = (props) => {
  const { x, y, label, width } = props;
  return (
    <text
      x={x + width / 2}
      y={y}
      dy={-10}
      textAnchor="middle"
      fill="#999999"
      style={{
        fontSize: '10px',
        fontWeight: '400',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </text>
  );
};

const CustomBarShape = ({
  x,
  y,
  width,
  height,
  fill,
  payload,
  customStyles,
  onBarClick,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (onBarClick) {
          onBarClick(payload);
        }
      }}
      style={onBarClick ? { cursor: 'pointer' } : undefined}
    >
      <path
        d={`
          M${x},${y + height}
          V${y + 6}
          Q${x},${y} ${x + 6},${y}
          H${x + width - 6}
          Q${x + width},${y} ${x + width},${y + 6}
          V${y + height}
          Z
        `}
        fill={hovered ? customStyles?.onHoverBarBg : customStyles?.defaultBarBg} // Custom hover color
      />
    </g>
  );
};

const BarGraph = ({
  data,
  xDataKey,
  yDataKey,
  customStyles,
  insideLabel = false,
  xAxisLabel,
  yAxisLabel,
  isLoading = false,
  aspect = 1.5,
  margin = { top: 15, right: 15, left: 5, bottom: 30 },
  width = '100%',
  height = '100%',
  onBarClick,
  skeletonClassName = '',
  containerClassName = '',
  barChartClassName = '',
}) => {
  return (
    <div className="h-full w-full">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <BarGraphSkeleton className={skeletonClassName} />
        </div>
      ) : (
        <ResponsiveContainer
          width={width}
          height={height}
          // minHeight={350}
          aspect={aspect}
          className={containerClassName}
        >
          <style>
            {`
          .recharts-tooltip-cursor {
            display: none !important;
          }
             
        `}
          </style>
          <BarChart
            data={data}
            width={width}
            height={height}
            margin={margin}
            className={barChartClassName}
          >
            <CartesianGrid
              horizontal={true}
              vertical={false}
              strokeDasharray="10 10"
              stroke="rgba(0, 0, 0, 0.1)"
            />
            <XAxis
              dataKey={xDataKey}
              axisLineColor="rgba(0, 0, 0, 0.1)"
              tickLine={false}
              fontSize={12}
              axisLine={false}
              textColor="rgba(0, 0, 0, 0.4)"
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
              dataKey={yDataKey}
              axisLine={false}
              tickLine={false}
              textColor="rgba(0, 0, 0, 0.4)"
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
            <Bar
              dataKey={yDataKey}
              radius={[6, 6, 0, 0]}
              isAnimationActive={true}
              barSize={32}
              minPointSize={1}
              label={{
                position: 'top',
                fontSize: 14,
                fontWeight: 600,
                fill: 'rgba(0, 0, 0, 1)',
              }}
              shape={
                <CustomBarShape
                  customStyles={customStyles}
                  onBarClick={onBarClick}
                />
              }
              background={{
                fill: customStyles?.barTrackBg ?? 'rgba(70, 0, 242, 0.04)',
              }}
            >
              {insideLabel && (
                <LabelList
                  dataKey={yDataKey}
                  content={({ x, y, width, value }) => {
                    const labelX = x + width / 2;
                    const labelY = y + 10;

                    return (
                      <foreignObject
                        x={labelX - 15}
                        y={labelY - 3}
                        width={30}
                        height={20}
                      >
                        <div
                          xmlns="http://www.w3.org/1999/xhtml"
                          style={{
                            backgroundColor: customStyles?.defaultBarBg,
                            color: customStyles?.defaultBarTextColor,
                            fontSize: 10,
                            fontWeight: 500,
                            borderRadius: '5px',
                            padding: '2px 5px',
                            textAlign: 'center',
                            width: 'max-content',
                            margin: 'auto',
                          }}
                        >
                          {value}
                        </div>
                      </foreignObject>
                    );
                  }}
                />
              )}

              <LabelList dataKey={xDataKey} content={CustomLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default BarGraph;
