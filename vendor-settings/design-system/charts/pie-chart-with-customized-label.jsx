'use client';

import { useState } from 'react';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import PieChartSkeleton from './graph-skeletons/pie-chart-skeleton';

const PieChartWithCustomizedLabel = ({
  data,
  colors = ['#0088FE', '#00C49F', '#FFBB28'],
  title,
  customStyles,
  isLoading,
}) => {
  const [selectedSliceIndex, setSelectedSliceIndex] = useState(null);
  const RADIAN = Math.PI / 180;

  if (isLoading) {
    return <PieChartSkeleton />;
  }

  const handleSliceClick = (index) => {
    setSelectedSliceIndex(index);
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Background circle for the percentage text
    const backgroundColor = customStyles?.backgroundColor || '#2D3B42';
    const backgroundRadius = customStyles?.backgroundRadius || 16;

    return (
      <>
        {/* Background Circle */}
        <circle cx={x} cy={y} r={backgroundRadius} fill={backgroundColor} />
        {/* Percentage Text */}
        <text
          x={x}
          y={y}
          fill="#fff" // White color for the percentage text
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={customStyles?.fontSize || 10}
          fontWeight={customStyles?.fontWeight || '700'}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      </>
    );
  };

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-center md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart width={350} height={350}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              fill="#fff"
              dataKey="value"
              onClick={({ activeIndex }) => handleSliceClick(activeIndex)} // Handle click event
            >
              {data?.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  stroke={selectedSliceIndex === index ? '#000' : 'transparent'} // Add border when selected
                  strokeWidth={3} // Border thickness
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend Below Pie Chart */}
      {data && data?.length > 0 && (
        <div className="mt-1 flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-2">
          {data?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                style={{ backgroundColor: colors[index % colors.length] }}
                className="h-3 w-3 rounded-full"
              />
              <span className="text-sm font-medium capitalize text-black/80">
                {entry?.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PieChartWithCustomizedLabel;
