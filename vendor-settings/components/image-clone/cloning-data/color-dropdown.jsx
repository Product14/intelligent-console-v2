import React, { useEffect, useRef, useState } from 'react';

const ColorDropdown = ({ availableColors, chosenColor, handleColorChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Helper function to parse color combinations and create color display
  const parseColorCombination = (colorString) => {
    if (!colorString) return { colors: [], style: {} };

    // Split by comma and clean up
    const colors = colorString
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c);

    const colorMap = {
      red: '#FF0000',
      hot: '#FF4500',
      white: '#FFFFFF',
      black: '#000000',
      blue: '#0000FF',
      green: '#008000',
      yellow: '#FFFF00',
      orange: '#FFA500',
      purple: '#800080',
      pink: '#FFC0CB',
      gray: '#808080',
      grey: '#808080',
      silver: '#C0C0C0',
      gold: '#FFD700',
      brown: '#A52A2A',
      tan: '#D2B48C',
      'red hot': '#FF4500',
      'hot red': '#FF4500',
      'bright red': '#FF0000',
      'dark red': '#8B0000',
      'light red': '#FF6B6B',
      crimson: '#DC143C',
      navy: '#000080',
      'light blue': '#ADD8E6',
      'dark blue': '#00008B',
      'light green': '#90EE90',
      'dark green': '#006400',
      lime: '#00FF00',
      cyan: '#00FFFF',
      teal: '#008080',
      magenta: '#FF00FF',
      'light gray': '#D3D3D3',
      'dark gray': '#404040',
      charcoal: '#36454F',
    };

    if (colors.length === 1) {
      // Single color - try to find hex or use default
      const singleColor = colors[0].toLowerCase();
      const hexColor = colorMap[singleColor] || '#666';

      return {
        colors: [colors[0]],
        style: {
          backgroundColor: hexColor,
          border: hexColor === '#666' ? '1px solid #ddd' : 'none',
        },
      };
    } else if (colors.length > 1) {
      // Multiple colors - create gradient or split circle
      const hexColors = colors.map((color) => {
        const normalizedColor = color.toLowerCase();
        return colorMap[normalizedColor] || '#666';
      });

      if (colors.length === 2) {
        // Create linear gradient for 2 colors
        return {
          colors: colors,
          style: {
            background: `linear-gradient(45deg, ${hexColors[0]} 0%, ${hexColors[1]} 100%)`,
            border: 'none',
          },
        };
      } else {
        // For 3+ colors, create a radial gradient or use first color
        return {
          colors: colors,
          style: {
            background: `radial-gradient(circle, ${hexColors.join(', ')})`,
            border: 'none',
          },
        };
      }
    }

    return { colors: [], style: {} };
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col gap-1">
      {/* <label htmlFor="color-select" className="text-xs font-medium text-gray-600 uppercase tracking-wide">Choose Color</label> */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className="flex w-44 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-10"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="flex items-center gap-2">
            {chosenColor && chosenColor !== 'All Colors' && (
              <div
                className="h-3 w-3 rounded-full border-2 border-white shadow-sm"
                style={parseColorCombination(chosenColor).style}
                title={parseColorCombination(chosenColor).colors.join(', ')}
              />
            )}
            {chosenColor === 'All Colors' && (
              <div
                className="h-3 w-3 rounded-full border-2 border-white shadow-sm"
                style={{
                  background:
                    'linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080)',
                }}
                title="All Colors"
              />
            )}
            <span className="text-gray-700">
              {chosenColor
                ? availableColors.find((color) => color.color === chosenColor)
                    ?.name || chosenColor
                : 'Choose Color'}
            </span>
          </div>
          <svg
            className={`h-4 w-4 flex-shrink-0 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
            {availableColors.map((color, index) => (
              <button
                key={index}
                type="button"
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                onClick={() => {
                  handleColorChange(color.color);
                  setIsDropdownOpen(false);
                }}
              >
                {color.color !== 'All Colors' && (
                  <div
                    className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
                    style={parseColorCombination(color.color).style}
                    title={parseColorCombination(color.color).colors.join(', ')}
                  />
                )}
                {color.color === 'All Colors' && (
                  <div
                    className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
                    style={{
                      background:
                        'linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080)',
                    }}
                    title="All Colors"
                  />
                )}
                <span>{color.name || color.color}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorDropdown;
