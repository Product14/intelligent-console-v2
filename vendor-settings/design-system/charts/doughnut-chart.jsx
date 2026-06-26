import { useEffect, useRef } from 'react';

import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export const GaugeChart = ({ domStats }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!domStats) return;

    const currentValue = domStats?.mean;
    const maxValue = 180;
    const minValue = 0;

    // Cap the current value at maxValue
    const cappedValue = Math.min(currentValue, maxValue);
    const percentage = (cappedValue / maxValue) * 100;
    const data = {
      labels: ['Value', 'Remaining'],
      datasets: [
        {
          data: [Math.round(percentage), Math.round(100 - percentage)],
          backgroundColor: ['#3A5AFE', '#E9EDF0'],
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
          tooltip: { enabled: true },
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

            // Draw the mean value
            ctx.font = 'bold 30px Inter';
            ctx.fillStyle = '#404040';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
              `${Math.round(cappedValue)}`,
              width / 2,
              height / 2 - -25
            );

            ctx.restore();
          },
        },
        {
          id: 'borderLine',
          afterDraw: (chart) => {
            const { ctx, width, height } = chart;
            ctx.save();

            // Calculate the radius and center point
            const chartArea = chart.chartArea;
            const centerX = (chartArea.left + chartArea.right) / 2;
            const centerY = (chartArea.top + chartArea.bottom) / 2;
            const radius =
              Math.min(
                chartArea.right - chartArea.left,
                chartArea.bottom - chartArea.top
              ) / 2;
            const innerRadius = radius * 0.75;
            const outerRadius = radius;

            // Draw the left border line (min value)                       // Add min value (left aligned)
            ctx.font = '14px Inter';
            ctx.fillStyle = '#6B7280';
            ctx.textAlign = 'left';
            ctx.fillText(`${minValue}`, 20, height - 40);

            // Add max value (right aligned)
            ctx.textAlign = 'right';
            ctx.fillText(`${maxValue}`, width - 20, height - 40);

            ctx.restore();
          },
        },
      ],
    };

    const chartInstance = new Chart(chartRef.current, config);

    return () => {
      chartInstance.destroy();
    };
  }, [domStats]);

  if (!domStats) return null;

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="w-full" style={{ width: '200px', height: '200px' }}>
        <canvas ref={chartRef} />
      </div>
      <div className="mt-2 w-full max-w-[225px] text-center">
        <p className="text-base font-bold text-black/80">Days on Market</p>
        <p className="mt-1 text-sm font-normal text-black/60">
          The car stayed online till {Math.round(domStats?.mean)} days and sold
          out
        </p>
      </div>
    </div>
  );
};
