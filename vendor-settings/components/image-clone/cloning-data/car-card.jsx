import React from 'react';
import { GrShare } from 'react-icons/gr';

const CarCard = ({ vehicle, onUseMedia }) => {
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

  const handleUseMedia = () => {
    if (onUseMedia) {
      onUseMedia(vehicle);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:transform hover:shadow-lg">
      <div className="h-50 relative w-full overflow-hidden">
        <img
          src={
            vehicle.imageUrl ||
            vehicle.catalogThumbnail ||
            '/placeholder-car.jpg'
          }
          alt={`${vehicle.color} ${vehicle.make} ${vehicle.model}`}
          className="h-full w-full object-cover object-center"
          onError={(e) => {
            e.target.src = '/placeholder-car.jpg';
          }}
        />
        {/* Preview Icon in bottom right */}
        <div
          className="absolute bottom-2 right-2 flex cursor-pointer items-center gap-1 rounded-[50px] border border-white/20 bg-black/60 px-2 py-1"
          onClick={() => {
            window.open(
              `${process.env.NEXT_PUBLIC_COMMON_IFRAME_URL}/360?version=v3&mediaId=${vehicle?.mediaId}&spin=1&catalog=2&feature_video=3`,
              '_blank'
            );
          }}
        >
          <GrShare className="text-white" height={10} width={10} />
          <span className="text-xs font-normal text-white">Preview</span>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-3 flex flex-col">
          <span>
            <span className="text-xs font-normal text-black/40">
              Ext. Color:{' '}
            </span>
            <span className="text-xs font-medium text-black/80">
              {vehicle.exteriorColor}
            </span>
          </span>
          <span>
            <span className="text-xs font-normal text-black/40">
              Int. Color:{' '}
            </span>
            <span className="text-xs font-medium text-black/80">
              {vehicle.interiorColor}
            </span>
          </span>
        </div>
        <button
          className="w-full cursor-pointer rounded-lg border-none bg-[rgba(70,0,242,0.06)] px-4 py-2.5 text-sm font-medium text-[rgba(0,0,0,0.8)] transition-colors duration-200 ease-in-out hover:bg-[rgba(70,0,242,0.09)] active:translate-y-px active:transform"
          onClick={handleUseMedia}
        >
          Use Media
        </button>
      </div>
    </div>
  );
};

export default CarCard;
