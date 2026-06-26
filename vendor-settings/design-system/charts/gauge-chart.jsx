import { useEffect, useRef } from 'react';

import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function GaugeChart({
  value,
  maxValue = 100,
  minValue = 0,
  unit = '',
  title = '',
  subtitle = '',
  primaryColor = '#3A5AFE',
  width = '200px',
  height = '200px',
}) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (value === undefined || value === null) return;

    const cappedValue = Math.min(Math.max(value, minValue), maxValue);
    const percentage = ((cappedValue - minValue) / (maxValue - minValue)) * 100;

    // Dynamically change the color based on value (Profit: Green, Loss: Red)
    const dynamicColor =
      cappedValue > (maxValue + minValue) / 2 ? '#4CAF50' : '#FF5722';

    const data = {
      labels: ['Value', 'Remaining'],
      datasets: [
        {
          data: [Math.round(percentage), Math.round(100 - percentage)],
          borderWidth: 0,
          circumference: 180,
          rotation: -90,
        },
      ],
    };

    const config = {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        cutout: '75%',
        plugins: {
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.raw || 0;
                return `${label}: ${value}${unit}`;
              },
            },
          },
          legend: { display: false },
        },
        layout: {
          padding: {
            top: 0,
            bottom: 0,
            left: 15,
            right: 15,
          },
        },
      },
      plugins: [
        {
          id: 'centerText',
          beforeDraw: (chart) => {
            const { ctx, width, height } = chart;
            ctx.save();
            ctx.font = 'bold 30px Inter';
            ctx.fillStyle = '#404040';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
              `${Math.round(cappedValue)}${unit}`,
              width / 2,
              height / 2 - 25,
            );
            ctx.restore();
          },
        },
        {
          id: 'borderLine',
          afterDraw: (chart) => {
            const { ctx, width, height } = chart;
            ctx.save();
            ctx.font = '14px Inter';
            ctx.fillStyle = '#6B7280';

            // Min value (left aligned)
            ctx.textAlign = 'left';
            ctx.fillText(`${minValue}${unit}`, 20, height - 40);

            // Max value (right aligned)
            ctx.textAlign = 'right';
            ctx.fillText(`${maxValue}${unit}`, width - 20, height - 40);

            // Current Value
            ctx.fillText(
              `${Math.round(cappedValue)}${unit}`,
              width / 2,
              height / 2 + 50,
            );

            ctx.restore();
          },
        },
      ],
    };

    const chartInstance = new Chart(chartRef.current, config);

    return () => {
      chartInstance.destroy();
    };
  }, [value, maxValue, minValue, unit, primaryColor]);

  if (value === undefined || value === null) return null;

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="w-full" style={{ width, height }}>
        <canvas ref={chartRef} />
      </div>
      {(title || subtitle) && (
        <div className="mt-2 w-full max-w-[225px] text-center">
          {title && (
            <p className="text-base font-bold text-black/80">{title}</p>
          )}
          {subtitle && (
            <p className="mt-1 text-sm font-normal text-black/60">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}
