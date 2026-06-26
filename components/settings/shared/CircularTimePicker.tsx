import React, { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@spyne-console/utils/cn';

type SelectionMode = 'hour' | 'minute';

interface CircularTimePickerProps {
  value: { hour: string; minute: string; period?: string };
  onChange: (time: { hour: string; minute: string; period?: string }) => void;
  use24Hour?: boolean;
  className?: string;
  mode: SelectionMode;
  onModeChange: (mode: SelectionMode) => void;
  minuteStep?: number;
}

const CircularTimePicker: React.FC<CircularTimePickerProps> = ({
  value,
  onChange,
  use24Hour = false,
  className = '',
  mode,
  onModeChange,
  minuteStep = 5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const canvasSize = 280;
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  const radius = 105;

  const drawClock = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;

    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;

    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    if (mode === 'hour') {
      const numbers = use24Hour ? 24 : 12;
      const currentHour = parseInt(value.hour);

      for (let i = 1; i <= numbers; i++) {
        const angle = (i / numbers) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        const displayValue = i;
        const isSelected = i === currentHour;

        ctx.font = isSelected
          ? '700 18px Roboto, sans-serif'
          : '600 16px Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isSelected ? '#000000' : 'rgba(0, 0, 0, 0.6)';
        ctx.fillText(displayValue.toString(), x, y);
      }

      const currentAngle = (currentHour / numbers) * 2 * Math.PI - Math.PI / 2;
      const lineEndX = centerX + radius * Math.cos(currentAngle);
      const lineEndY = centerY + radius * Math.sin(currentAngle);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(lineEndX, lineEndY);
      ctx.strokeStyle = '#4600F2';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#4600F2';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(lineEndX, lineEndY, 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#4600F2';
      ctx.fill();
    } else {
      const currentMinute = parseInt(value.minute);
      const minuteValues: number[] = [];
      for (let i = 0; i < 60; i += minuteStep) {
        minuteValues.push(i);
      }

      const totalSteps = minuteValues.length;

      for (let i = 0; i < minuteValues.length; i++) {
        const minute = minuteValues[i];
        const angle = (i / totalSteps) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        const isSelected = minute === currentMinute;

        ctx.font = isSelected
          ? '700 18px Roboto, sans-serif'
          : '600 16px Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isSelected ? '#000000' : 'rgba(0, 0, 0, 0.6)';
        ctx.fillText(minute.toString().padStart(2, '0'), x, y);
      }

      const minuteIndex = minuteValues.findIndex((m) => m === currentMinute);
      const validMinuteIndex = minuteIndex >= 0 ? minuteIndex : 0;
      const currentAngle =
        (validMinuteIndex / totalSteps) * 2 * Math.PI - Math.PI / 2;
      const lineEndX = centerX + radius * Math.cos(currentAngle);
      const lineEndY = centerY + radius * Math.sin(currentAngle);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(lineEndX, lineEndY);
      ctx.strokeStyle = '#4600F2';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#4600F2';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(lineEndX, lineEndY, 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#4600F2';
      ctx.fill();
    }
  }, [value.hour, value.minute, use24Hour, mode, minuteStep, canvasSize]);

  useEffect(() => {
    drawClock();
  }, [drawClock]);

  const getTimeFromPosition = (x: number, y: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = x - rect.left;
    const clickY = y - rect.top;

    const dx = clickX - centerX;
    const dy = clickY - centerY;

    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;

    if (mode === 'hour') {
      const numbers = use24Hour ? 24 : 12;
      let hour = Math.round((angle / (2 * Math.PI)) * numbers);
      if (hour === 0) hour = numbers;

      onChange({
        hour: hour.toString().padStart(2, '0'),
        minute: value.minute,
        period: value.period,
      });
    } else {
      const totalSteps = Math.floor(60 / minuteStep);
      const minuteIndex =
        Math.round((angle / (2 * Math.PI)) * totalSteps) % totalSteps;
      const minute = minuteIndex * minuteStep;

      onChange({
        hour: value.hour,
        minute: minute.toString().padStart(2, '0'),
        period: value.period,
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    getTimeFromPosition(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      getTimeFromPosition(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    const touch = e.touches[0];
    getTimeFromPosition(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const touch = e.touches[0];
      getTimeFromPosition(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className={cn('flex w-full flex-col gap-4', className)}>
      <div className="flex w-full items-center justify-center rounded-xl bg-[rgba(0,0,0,0.04)] px-2.5 py-2">
        <div
          className="flex items-center justify-center gap-1.5 font-medium tracking-[2.52px]"
          style={{ fontFamily: 'Roboto, sans-serif', fontSize: '36px' }}
        >
          <button
            onClick={() => onModeChange('hour')}
            className={cn(
              'cursor-pointer transition-colors',
              mode === 'hour' ? 'text-black' : 'text-[rgba(0,0,0,0.4)]'
            )}
          >
            {value.hour}:
          </button>
          <button
            onClick={() => onModeChange('minute')}
            className={cn(
              'cursor-pointer transition-colors',
              mode === 'minute' ? 'text-black' : 'text-[rgba(0,0,0,0.4)]'
            )}
          >
            {value.minute}
          </button>
          {!use24Hour && (
            <button
              onClick={() =>
                onChange({
                  ...value,
                  period: value.period === 'AM' ? 'PM' : 'AM',
                })
              }
              className="ml-2 cursor-pointer text-black transition-opacity hover:opacity-70"
              style={{ fontSize: '34px' }}
            >
              {value.period}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center bg-white p-2">
        <canvas
          ref={canvasRef}
          className="cursor-pointer"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>
    </div>
  );
};

export default CircularTimePicker;
