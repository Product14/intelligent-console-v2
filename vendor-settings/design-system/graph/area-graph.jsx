'use client';

import {
  Area,
  AreaChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function AreaGraph({
  data,
  xAxisKey,
  dataKeys,
  width = 200,
  height = 200,
  xAxisLabel = 'X Axis',
  yAxisLabel = 'Y Axis',
  colors = ['#AE8CFF'], // Default colors
  recommendedPrice,
}) {
  // Find the maximum value for both X and Y axes
  const maxXValue = Math.max(...data.map((item) => item[xAxisKey]));
  const maxYValues = dataKeys.map((key) =>
    Math.max(...data.map((item) => item[key]))
  );
  const maxYValue = Math.max(...maxYValues);

  // Find the data point with the maximum value
  const maxDataPoint = data.reduce(
    (max, item) => {
      const itemMaxValue = Math.max(...dataKeys.map((key) => item[key] || 0));
      return itemMaxValue > (max.value || 0)
        ? { x: item[xAxisKey], value: itemMaxValue }
        : max;
    },
    { x: 0, value: 0 }
  );

  // Generate fixed interval ticks for Y-axis with interval of 10 up to 50
  const generateYTicks = () => {
    return [0, 10, 20, 30, 40, 50];
  };

  // Generate X ticks with fixed intervals of 10 (in thousands)
  const generateXTicks = (maxValue) => {
    const adjustedMax = Math.ceil(maxValue / 10000) * 10000; // Adjust for thousands
    const interval = 10000; // Fixed interval of 10,000
    return Array.from(
      { length: Math.ceil(adjustedMax / interval) + 1 },
      (_, i) => i * interval
    );
  };

  const xTicks = generateXTicks(maxXValue);
  const yTicks = generateYTicks();

  return (
    <AreaChart
      width={width}
      height={height}
      data={data}
      margin={{
        left: 0,
        right: 0,
        top: 10,
        bottom: 40, // Increased bottom margin to fit labels
      }}
    >
      <XAxis
        dataKey={xAxisKey}
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        label={{
          value: xAxisLabel,
          position: 'bottom',
          offset: 20, // Increased offset to avoid overlap
          style: { fontSize: '12px' },
        }}
        tickFormatter={(value) => Math.floor(value / 1000)} // Display in thousands
        ticks={xTicks} // Use custom ticks
        style={{ fontSize: '12px' }}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={1}
      />
      <YAxis
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        label={{
          value: yAxisLabel,
          angle: -90,
          position: 'insideLeft',
          offset: 10,
          style: { fontSize: '12px', textAnchor: 'middle' },
        }}
        interval={0}
        ticks={yTicks}
        style={{ fontSize: '12px' }}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={1}
        domain={[0, 50]}
      />
      <ReferenceLine
        x={maxDataPoint.x}
        stroke="#AE8CFF"
        strokeWidth={1}
        strokeDasharray="3 3"
        label={false}
        height={maxDataPoint.y}
      />
      <Tooltip
        formatter={() => null}
        content={({ label }) => (
          <div className="rounded-lg bg-black p-2">
            <p className="text-xs text-white">{`$ ${Number(label).toLocaleString()}`}</p>{' '}
            {/* Only showing X-axis data */}
          </div>
        )}
      />
      <defs>
        {dataKeys.map((key, index) => (
          <linearGradient
            key={`gradient-${key}`}
            id={`fill${key}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor={colors[index % colors.length]}
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor={colors[index % colors.length]}
              stopOpacity={0.1}
            />
          </linearGradient>
        ))}
      </defs>
      {dataKeys.map((key, index) => (
        <Area
          key={key}
          dataKey={key}
          type="natural"
          fill={`url(#fill${key})`}
          fillOpacity={0.4}
          stroke={colors[index % colors.length]}
          strokeWidth={0.5}
          stackId="a"
        />
      ))}
    </AreaChart>
  );
}
