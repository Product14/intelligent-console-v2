'use client';

import React from 'react';

const DATA_POINTS = 6;

const LineChartSkeleton = () => {
  return (
    <div className="w-full">
      <div className="flex h-[300px] w-full flex-col">
        {/* Main Chart Area */}
        <div className="relative flex h-full w-full items-end px-4">
          {/* Line Chart Lines */}
          <div className="flex h-full w-full items-end">
            <svg
              className="h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="line-gradient"
                  x1="0"
                  y1="0"
                  x2="100%"
                  y2="0"
                >
                  <stop offset="0%" stopColor="rgba(70, 0, 242, 0.1)" />
                  <stop offset="50%" stopColor="rgba(70, 0, 242, 0.2)" />
                  <stop offset="100%" stopColor="rgba(70, 0, 242, 0.1)" />
                </linearGradient>
              </defs>

              {/* Background line */}
              <path
                d="M0,80 L20,40 L40,60 L60,20 L80,50 L100,30"
                className="stroke-[#4600F2] opacity-5"
                strokeWidth="0.2"
                fill="none"
              />

              {/* Animated lines */}
              {[...Array(3)].map((_, index) => (
                <path
                  key={index}
                  d="M0,80 L20,40 L40,60 L60,20 L80,50 L100,30"
                  stroke="url(#line-gradient)"
                  strokeWidth="0.4"
                  fill="none"
                  style={{
                    animation: `shimmer${index} 1.5s ease-in-out infinite ${index * 0.3}s`,
                  }}
                />
              ))}

              {/* X-axis line */}
              <line
                x1="0"
                y1="100"
                x2="100"
                y2="100"
                stroke="#E5E7EB"
                strokeWidth="0.5"
              />
            </svg>
          </div>
        </div>

        {/* X-Axis Labels */}
        <div className="mt-4 flex justify-between px-4">
          {[...Array(DATA_POINTS)].map((_, i) => (
            <div key={i} className="h-4 w-16" />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer0 {
          0% {
            stroke-dasharray: 150;
            stroke-dashoffset: 150;
            opacity: 0.1;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            stroke-dasharray: 150;
            stroke-dashoffset: -150;
            opacity: 0.1;
          }
        }

        @keyframes shimmer1 {
          0% {
            stroke-dasharray: 150;
            stroke-dashoffset: 150;
            opacity: 0.1;
          }
          50% {
            opacity: 0.25;
          }
          100% {
            stroke-dasharray: 150;
            stroke-dashoffset: -150;
            opacity: 0.1;
          }
        }

        @keyframes shimmer2 {
          0% {
            stroke-dasharray: 150;
            stroke-dashoffset: 150;
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
          100% {
            stroke-dasharray: 150;
            stroke-dashoffset: -150;
            opacity: 0.1;
          }
        }
      `}</style>
    </div>
  );
};

export default LineChartSkeleton;
