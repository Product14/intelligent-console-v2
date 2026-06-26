import React, { useEffect, useRef, useState } from 'react';

const ColorSquare = ({ onAddColor, hexCode, setColorInput }) => {
  const [showpicker, setShowPicker] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [rgb, setRgb] = useState({ r: 255, g: 255, b: 255 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);

  const squareStyle = {
    width: '24px',
    height: '24px',
    backgroundColor: hexCode,
  };

  const rgbToHex = (r, g, b) => {
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  };

  // Helper to pick color from canvas at given mouse event position
  const pickColorFromCanvas = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, canvas.width - 1));
    const y = Math.max(0, Math.min(e.clientY - rect.top, canvas.height - 1));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.getImageData(x, y, 1, 1).data;
    const [r, g, b] = imageData;
    const hex = rgbToHex(r, g, b);
    setColor(hex);
    setRgb({ r, g, b });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    // Pick color immediately on click (don't wait for drag)
    pickColorFromCanvas(e);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    pickColorFromCanvas(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleAddColor = () => {
    onAddColor(color);
    setColorInput(color);
    setShowPicker(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.17, 'orange');
    gradient.addColorStop(0.34, 'yellow');
    gradient.addColorStop(0.51, 'green');
    gradient.addColorStop(0.68, 'cyan');
    gradient.addColorStop(0.85, 'blue');
    gradient.addColorStop(1, 'purple');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [showpicker]);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={() => {
          setShowPicker(true);
        }}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white shadow-sm transition hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4600F2]/20"
        aria-label="Pick a color"
      >
        <span
          className="h-6 w-6 rounded border border-gray-200"
          style={squareStyle}
        ></span>
      </button>
      {showpicker ? (
        <div className="absolute right-0 top-12 z-20 rounded-lg bg-white p-6 shadow-lg">
          <canvas
            ref={canvasRef}
            width="300"
            height="150"
            className="mb-2 cursor-crosshair rounded-t-lg"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          ></canvas>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-col items-center">
              <span>Hex</span>
              <input
                type="text"
                value={color}
                readOnly
                className="w-[6rem] rounded-md border p-2"
              />
            </div>
            <div className="flex flex-col items-center">
              <span>R</span>
              <input
                type="text"
                value={rgb.r}
                readOnly
                className="w-[4rem] rounded-md border p-2"
              />
            </div>
            <div className="flex flex-col items-center">
              <span>G</span>
              <input
                type="text"
                value={rgb.g}
                readOnly
                className="w-[4rem] rounded-md border p-2"
              />
            </div>
            <div className="flex flex-col items-center">
              <span>B</span>
              <input
                type="text"
                value={rgb.b}
                readOnly
                className="w-[4rem] rounded-md border p-2"
              />
            </div>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => {
                setShowPicker(false);
              }}
              className="py-1.25 rounded-md border border-gray-300 bg-white px-12"
            >
              Cancel
            </button>
            <button
              className="py-1.25 order-8 rounded-md border-[8px] border-[#4600F2] bg-[#4600F2] px-12 text-white"
              onClick={handleAddColor}
            >
              Add
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ColorSquare;
