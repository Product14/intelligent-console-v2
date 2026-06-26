import { useEffect, useRef } from 'react';

import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Function to generate normal distribution data
const generateData = (mean, stdDev) => {
  const points = 50;
  const data = [];

  // Calculate range ensuring non-negative values
  const minValue = Math.max(0, mean - 2.5 * stdDev);
  const maxValue = mean + 2.5 * stdDev;
  const range = maxValue - minValue;

  // Generate points for a bell curve
  for (let i = 0; i < points; i++) {
    // Create x values with proper spacing
    const x = minValue + (i * range) / (points - 1);

    // Calculate normalized y values for smoother curve
    const zScore = (x - mean) / stdDev;
    const y = Math.exp(-0.5 * zScore * zScore);

    // Scale the y values for better visibility
    const scaledY = (y * 50) / (stdDev * Math.sqrt(2 * Math.PI));

    data.push(Math.max(0, scaledY));
  }

  // Normalize the curve height
  const maxY = Math.max(...data);
  return data.map((y) => y * (100 / maxY));
};

export const Charts = ({
  labelData,
  datapointData,
  gradientColors = {
    start: '#5BC4FF',
    end: '#FF5BEF',
  },
  unit = null,
  sign = null,
}) => {
  const chartRef = useRef(null);

  const getGradient = (canvas) => {
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, gradientColors.start);
    gradient.addColorStop(1, gradientColors.end);
    return gradient;
  };

  useEffect(() => {
    const stats = datapointData;
    const datapoints = generateData(stats?.mean, stats?.standard_deviation);

    const data = {
      labels: Array.from({ length: 50 }, (_, i) => {
        // Ensure non-negative x-axis values
        const minPrice = Math.max(
          0,
          stats?.mean - 2 * stats?.standard_deviation
        );
        const maxPrice = stats?.mean + 2 * stats?.standard_deviation;
        const price = minPrice + (i * (maxPrice - minPrice)) / 49;
        return `${sign ? sign : ''}${Math.round(Math.max(0, price)).toLocaleString()}`;
      }),
      datasets: [
        {
          label: 'Price Distribution',
          data: datapoints,
          borderColor: getGradient(chartRef.current),
          backgroundColor: 'rgba(94, 195, 255, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 4,
          pointRadius: (context) => {
            return context.dataIndex % 8 === 0 ? 6 : 0;
          },
          pointBackgroundColor: 'white',
          pointBorderColor: getGradient(chartRef.current),
          pointBorderWidth: 2,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: 'white',
          pointHoverBorderColor: getGradient(chartRef.current),
          pointHoverBorderWidth: 3,
        },
      ],
    };

    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function (context) {
                return `Frequency: ${Math.round(context.parsed.y).toLocaleString()}`;
              },
            },
          },
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 45,
              autoSkip: true,
              maxTicksLimit: 8,
            },
            title: {
              display: unit ? true : false,
              text: `${unit}`,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'transparent',
            },
            ticks: {
              display: false,
            },
            title: {
              display: false,
              text: 'Frequency',
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
        maintainAspectRatio: false,
      },
    };

    const chartInstance = new Chart(chartRef.current, config);

    return () => {
      chartInstance.destroy();
    };
  }, [datapointData]);

  return (
    <div className="w-full">
      <div style={{ minHeight: '225px' }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};
